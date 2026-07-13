import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { getUserOrders } from "@/lib/orders/orders";
import { formatAmount } from "@/components/ui/Price";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("AccountOrders");
  return { title: t("metaTitle") };
}

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const orders = await getUserOrders(session.user.id);
  const t = await getTranslations("AccountOrders");
  const locale = await getLocale();

  return (
    <Container as="section" className="py-20 lg:py-28">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        className="mb-10"
      />

      {orders.length === 0 ? (
        <Card variant="filled" padding="lg">
          <p className="text-sm text-muted">{t("empty")}</p>
          <Link
            href="/shop"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            {t("browseShop")} →
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} variant="elevated" padding="lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString(locale)} ·{" "}
                    {order.status}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {formatAmount(order.total, order.currency)}
                  </span>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="text-xs uppercase tracking-[0.15em] text-accent hover:underline"
                  >
                    {t("details")} →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
