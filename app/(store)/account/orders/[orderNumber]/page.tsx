import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { getOrderByNumber } from "@/lib/orders/orders";
import { formatAmount } from "@/components/ui/Price";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function AccountOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber, session.user.id);

  if (!order) notFound();

  const t = await getTranslations("AccountOrderDetail");
  const tSummary = await getTranslations("OrderSummary");

  return (
    <Container as="section" className="py-20 lg:py-28">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={order.orderNumber}
        description={`${t("statusLabel")}: ${order.status}`}
        className="mb-10"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card variant="elevated" padding="lg" className="lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
            {tSummary("productsHeading")}
          </h2>
          <ul className="mt-6 space-y-4">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between border-b border-border pb-4 text-sm last:border-0"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-muted">
                    {[item.size, item.color].filter(Boolean).join(" · ")} ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <span>{formatAmount(item.total, order.currency)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="filled" padding="lg">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
            {tSummary("invoiceHeading")}
          </h2>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{tSummary("subtotal")}</dt>
              <dd>{formatAmount(order.subtotal, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{tSummary("discount")}</dt>
              <dd>-{formatAmount(order.discount, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{tSummary("shipping")}</dt>
              <dd>{formatAmount(order.shipping, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{tSummary("tax")}</dt>
              <dd>{formatAmount(order.tax, order.currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-medium">
              <dt>{tSummary("total")}</dt>
              <dd>{formatAmount(order.total, order.currency)}</dd>
            </div>
          </dl>

          {order.trackingNumber && (
            <p className="mt-4 text-xs text-muted">
              {tSummary("tracking", { number: order.trackingNumber })}
            </p>
          )}

          <Button
            href={`/api/orders/${order.id}/invoice`}
            variant="secondary"
            className="mt-6 w-full"
          >
            {tSummary("downloadInvoice")}
          </Button>
          <Link
            href="/account/orders"
            className="mt-4 block text-center text-xs uppercase tracking-[0.15em] text-muted hover:text-accent"
          >
            ← {t("backToOrders")}
          </Link>
        </Card>
      </div>
    </Container>
  );
}
