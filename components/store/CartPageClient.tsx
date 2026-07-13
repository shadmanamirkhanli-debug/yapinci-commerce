"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { useCart } from "@/components/providers/CartProvider";
import { formatAmount } from "@/components/ui/Price";

export default function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const t = useTranslations("Cart");
  const tSummary = useTranslations("OrderSummary");

  return (
    <>
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} className="mb-12" />

      {items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-secondary p-16 text-center">
          <p className="text-sm text-muted">{t("empty")}</p>
          <Button href="/shop" variant="ghost" size="sm" className="mt-6">
            {t("browseShop")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-6 rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-md"
              >
                <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-border">
                      {item.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h2 className="text-sm font-medium uppercase tracking-wide text-primary">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      {[item.size, item.color].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-sm text-accent">
                      {formatAmount(item.price, item.currency)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-full bg-secondary px-3 py-1.5">
                      <button
                        type="button"
                        className="text-sm text-muted transition-colors hover:text-primary"
                        aria-label={t("decreaseAria")}
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="text-xs font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        className="text-sm text-muted transition-colors hover:text-primary"
                        aria-label={t("increaseAria")}
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-xs tracking-[0.1em] uppercase text-muted transition-colors hover:text-primary"
                      onClick={() => removeItem(item.variantId)}
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-3xl border border-border bg-secondary p-8">
            <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
              {t("summaryHeading")}
            </h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">{tSummary("subtotal")}</span>
                <span className="text-primary">
                  {formatAmount(subtotal, items[0]?.currency ?? "AZN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{tSummary("shipping")}</span>
                <span className="text-accent">{tSummary("free")}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-4 font-medium text-primary">
                <span>{tSummary("total")}</span>
                <span>
                  {formatAmount(subtotal, items[0]?.currency ?? "AZN")}
                </span>
              </div>
            </div>
            <Button href="/checkout" className="mt-8 w-full">
              {t("checkoutCta")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
