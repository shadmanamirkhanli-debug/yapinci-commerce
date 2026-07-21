"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useCart } from "@/components/providers/CartProvider";
import { formatAmount } from "@/components/ui/Price";
import { cn } from "@/lib/utils/cn";
import {
  checkoutAddressSchema,
  checkoutCustomerSchema,
  checkoutShippingSchema,
  type CheckoutAddressInput,
  type CheckoutCustomerInput,
  type CheckoutOrderInput,
} from "@/lib/validations/checkout";

type CheckoutWizardProps = {
  defaultEmail?: string;
};

type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  freeShipping?: boolean;
};

export default function CheckoutWizard({ defaultEmail }: CheckoutWizardProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const t = useTranslations("CheckoutWizard");
  const tCart = useTranslations("Cart");
  const tSummary = useTranslations("OrderSummary");

  const STEPS = [
    t("stepCustomerInfo"),
    t("stepShippingAddress"),
    t("stepShippingMethod"),
    t("stepOrderSummary"),
  ];
  const [step, setStep] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [shippingMethods, setShippingMethods] = useState<
    { id: string; label: string; description: string; price: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [guestRedirect, setGuestRedirect] = useState<{
    resultUrl: string;
    bankRedirectUrl: string;
  } | null>(null);

  const customerForm = useForm<CheckoutCustomerInput>({
    resolver: zodResolver(checkoutCustomerSchema) as Resolver<CheckoutCustomerInput>,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: defaultEmail ?? "",
      phone: "",
    },
  });

  const addressForm = useForm<CheckoutAddressInput>({
    resolver: zodResolver(checkoutAddressSchema) as Resolver<CheckoutAddressInput>,
    defaultValues: {
      country: "AZ",
      city: "Bakı",
      region: "",
      postalCode: "",
      address: "",
    },
  });

  const shippingForm = useForm<{ shippingMethod: "standard" | "express" }>({
    resolver: zodResolver(checkoutShippingSchema) as Resolver<{
      shippingMethod: "standard" | "express";
    }>,
    defaultValues: { shippingMethod: "standard" },
  });

  const shippingMethod = useWatch({
    control: shippingForm.control,
    name: "shippingMethod",
  });

  useEffect(() => {
    void fetch("/api/shipping")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setShippingMethods(result.data.methods);
      });
  }, []);

  useEffect(() => {
    if (step < 2 || !shippingMethod) return;

    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtotal,
          shippingMethod,
          couponCode: appliedCoupon ?? undefined,
        }),
      });
      if (cancelled) return;

      const result = await response.json();
      if (cancelled) return;

      if (result.success) setTotals(result.data);
    })();

    return () => {
      cancelled = true;
    };
  }, [step, shippingMethod, appliedCoupon, subtotal]);

  const applyCoupon = async () => {
    setCouponError(null);
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    });
    const result = await response.json();
    if (!result.success) {
      setCouponError(result.error);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(couponCode.toUpperCase());
    setCouponError(null);
  };

  const placeOrder = async () => {
    setLoading(true);
    setServerError(null);

    const payload: CheckoutOrderInput = {
      customer: customerForm.getValues(),
      address: addressForm.getValues(),
      shippingMethod: shippingForm.getValues().shippingMethod,
      couponCode: appliedCoupon ?? undefined,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      setLoading(false);
      setServerError(result.error ?? t("orderError"));
      return;
    }

    clearCart();

    const orderId: string = result.data.id;
    const orderNumber: string = result.data.orderNumber;
    const guestToken: string | null = result.data.guestToken ?? null;
    const confirmationPath = guestToken
      ? `/checkout/confirmation/${orderNumber}?token=${guestToken}`
      : `/checkout/confirmation/${orderNumber}`;

    // Order is created either way from here on — a payment-start failure
    // never loses the order, it just sends the customer to the confirmation
    // page's retry state instead of straight to the bank.
    const paymentResponse = await fetch("/api/payments/pasha/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, guestToken: guestToken ?? undefined }),
    });

    if (paymentResponse.status === 503) {
      // PASHA not enabled yet — unchanged pre-integration behavior.
      setLoading(false);
      router.push(confirmationPath);
      router.refresh();
      return;
    }

    const paymentResult = await paymentResponse.json();

    if (!paymentResult.success) {
      setLoading(false);
      router.push(confirmationPath);
      router.refresh();
      return;
    }

    const bankRedirectUrl: string = paymentResult.data.redirectUrl;

    if (guestToken) {
      // Guests have no session to fall back on — show them their durable
      // result URL before we send the browser off to the bank, so a
      // never-returning browser (closed tab, crash, callback misconfigured
      // at the bank) still leaves them a way back to the order. A copy is
      // also emailed as a second channel (see sendGuestPaymentLinkEmail in
      // the start route) if the order has an email and SMTP is configured.
      setLoading(false);
      setGuestRedirect({
        resultUrl: `${window.location.origin}${confirmationPath}`,
        bankRedirectUrl,
      });
      return;
    }

    window.location.href = bankRedirectUrl;
  };

  const currency = items[0]?.currency ?? "AZN";

  if (guestRedirect) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-border bg-secondary p-10 text-center">
        <h2 className="text-sm font-medium uppercase tracking-[0.2em]">
          {t("guestSaveLinkHeading")}
        </h2>
        <p className="mt-4 text-sm text-muted">{t("guestSaveLinkBody")}</p>
        <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row">
          <code className="flex-1 overflow-x-auto rounded-xl border border-border bg-primary/5 px-4 py-3 text-left text-xs">
            {guestRedirect.resultUrl}
          </code>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void navigator.clipboard.writeText(guestRedirect.resultUrl)}
          >
            {t("copyLinkCta")}
          </Button>
        </div>
        <Button
          type="button"
          className="mt-8"
          onClick={() => {
            window.location.href = guestRedirect.bankRedirectUrl;
          }}
        >
          {t("continueToPaymentCta")}
        </Button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-border bg-secondary p-16 text-center">
        <p className="text-sm text-muted">{tCart("empty")}</p>
        <Button href="/shop" variant="ghost" size="sm" className="mt-6">
          {tCart("browseShop")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-10 flex flex-wrap gap-3">
          {STEPS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => index < step && setStep(index)}
              className={cn(
                "rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors",
                index === step
                  ? "bg-primary text-white"
                  : index < step
                    ? "bg-secondary text-primary"
                    : "bg-secondary text-muted"
              )}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>

        {step === 0 && (
          <form
            className="space-y-5 rounded-2xl border border-border p-6 lg:p-8"
            onSubmit={customerForm.handleSubmit(() => setStep(1))}
          >
            <h2 className="text-sm font-medium uppercase tracking-[0.2em]">
              {t("stepCustomerInfo")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t("firstNameLabel")}
                error={customerForm.formState.errors.firstName?.message}
                {...customerForm.register("firstName")}
              />
              <Input
                label={t("lastNameLabel")}
                error={customerForm.formState.errors.lastName?.message}
                {...customerForm.register("lastName")}
              />
            </div>
            <Input
              label={t("emailLabel")}
              type="email"
              error={customerForm.formState.errors.email?.message}
              {...customerForm.register("email")}
            />
            <Input
              label={t("phoneLabel")}
              type="tel"
              error={customerForm.formState.errors.phone?.message}
              {...customerForm.register("phone")}
            />
            <Button type="submit">{t("continueCta")}</Button>
          </form>
        )}

        {step === 1 && (
          <form
            className="space-y-5 rounded-2xl border border-border p-6 lg:p-8"
            onSubmit={addressForm.handleSubmit(() => setStep(2))}
          >
            <h2 className="text-sm font-medium uppercase tracking-[0.2em]">
              {t("stepShippingAddress")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t("countryLabel")}
                error={addressForm.formState.errors.country?.message}
                {...addressForm.register("country")}
              />
              <Input
                label={t("cityLabel")}
                error={addressForm.formState.errors.city?.message}
                {...addressForm.register("city")}
              />
              <Input label={t("regionLabel")} {...addressForm.register("region")} />
              <Input label={t("postalCodeLabel")} {...addressForm.register("postalCode")} />
            </div>
            <Textarea
              label={t("addressLabel")}
              rows={3}
              error={addressForm.formState.errors.address?.message}
              {...addressForm.register("address")}
            />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep(0)}>
                {t("backCta")}
              </Button>
              <Button type="submit">{t("continueCta")}</Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form
            className="space-y-5 rounded-2xl border border-border p-6 lg:p-8"
            onSubmit={shippingForm.handleSubmit(() => setStep(3))}
          >
            <h2 className="text-sm font-medium uppercase tracking-[0.2em]">
              {t("stepShippingMethod")}
            </h2>
            <div className="space-y-3">
              {shippingMethods.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors",
                    shippingMethod === method.id
                      ? "border-accent bg-secondary"
                      : "border-border hover:border-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      value={method.id}
                      {...shippingForm.register("shippingMethod")}
                    />
                    <div>
                      <p className="text-sm font-medium">{method.label}</p>
                      <p className="text-xs text-muted">{method.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {formatAmount(method.price, currency)}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                {t("backCta")}
              </Button>
              <Button type="submit">{t("continueCta")}</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-5 rounded-2xl border border-border p-6 lg:p-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em]">
              {t("stepOrderSummary")}
            </h2>

            <div className="flex gap-3">
              <Input
                placeholder={t("couponPlaceholder")}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={applyCoupon}>
                {t("applyCouponCta")}
              </Button>
            </div>
            {couponError && (
              <p className="text-sm text-error">{couponError}</p>
            )}
            {appliedCoupon && (
              <p className="text-sm text-accent">
                {t("couponApplied", { code: appliedCoupon })}
              </p>
            )}

            <p className="text-sm text-muted">
              {t("paymentNotice")}
            </p>

            {serverError && (
              <p className="text-sm text-error" role="alert">
                {serverError}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                {t("backCta")}
              </Button>
              <Button type="button" loading={loading} onClick={placeOrder}>
                {t("placeOrderCta")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-3xl border border-border bg-secondary p-8">
        <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
          {t("stepOrderSummary")}
        </h2>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between text-sm">
              <span className="text-muted">
                {item.name} × {item.quantity}
              </span>
              <span>{formatAmount(item.price * item.quantity, currency)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{tSummary("subtotal")}</dt>
            <dd>{formatAmount(totals?.subtotal ?? subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{tSummary("discount")}</dt>
            <dd>-{formatAmount(totals?.discount ?? 0, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{tSummary("shipping")}</dt>
            <dd>
              {totals?.freeShipping
                ? tSummary("free")
                : formatAmount(totals?.shipping ?? 0, currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{tSummary("tax")}</dt>
            <dd>{formatAmount(totals?.tax ?? 0, currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-medium text-primary">
            <dt>{tSummary("total")}</dt>
            <dd>{formatAmount(totals?.total ?? subtotal, currency)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
