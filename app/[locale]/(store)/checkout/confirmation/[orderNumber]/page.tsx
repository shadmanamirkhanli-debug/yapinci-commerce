import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { getOrderByNumber } from "@/lib/orders/orders";
import { auth } from "@/auth";
import { formatAmount } from "@/components/ui/Price";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { StoreLocale } from "@/lib/store/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CheckoutConfirmation");
  const locale = (await getLocale()) as StoreLocale;
  return createPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/checkout/confirmation",
    noIndex: true,
    locale,
  });
}

type ConfirmationPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function CheckoutConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const session = await auth();
  const { orderNumber } = await params;
  const { token } = await searchParams;
  const identity = session?.user?.id
    ? { userId: session.user.id }
    : token
      ? { guestToken: token }
      : {};
  const order = await getOrderByNumber(orderNumber, identity);

  if (!order) {
    notFound();
  }

  const t = await getTranslations("CheckoutConfirmation");
  const tCommon = await getTranslations("Common");

  return (
    <Container as="section" className="py-20 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-3xl font-light tracking-tight">
          {t("heading")}
        </h1>
        <p className="mt-4 text-sm text-muted">
          {t.rich("message", {
            strong: (chunks) => <strong>{chunks}</strong>,
            orderNumber: order.orderNumber,
            status: order.status,
          })}
        </p>
        <p className="mt-2 text-sm text-muted">
          {t("totalLine", { amount: formatAmount(order.total, order.currency) })}
        </p>
        <p className="mt-6 text-sm text-muted">
          {t("paymentNotice")}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          {session?.user?.id && (
            <Button href={`/account/orders/${order.orderNumber}`}>
              {t("viewOrderCta")}
            </Button>
          )}
          <Button href="/shop" variant="secondary">
            {tCommon("continueShopping")}
          </Button>
        </div>
      </div>
    </Container>
  );
}
