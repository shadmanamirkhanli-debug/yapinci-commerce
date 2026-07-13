import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { getOrderByNumber } from "@/lib/orders/orders";
import { auth } from "@/auth";
import { formatAmount } from "@/components/ui/Price";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Sifariş Təsdiqi",
    description: "Sifarişiniz uğurla qeydə alındı.",
    path: "/checkout/confirmation",
    noIndex: true,
  });
}

type ConfirmationPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function CheckoutConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const session = await auth();
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber, session?.user?.id);

  if (!order) {
    notFound();
  }

  return (
    <Container as="section" className="py-20 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
          Sifariş Təsdiqləndi
        </p>
        <h1 className="mt-4 text-3xl font-light tracking-tight">
          Təşəkkür edirik!
        </h1>
        <p className="mt-4 text-sm text-muted">
          Sifarişiniz <strong>{order.orderNumber}</strong> qeydə alındı.
          Status: <strong>{order.status}</strong>
        </p>
        <p className="mt-2 text-sm text-muted">
          Cəmi: {formatAmount(order.total, order.currency)}
        </p>
        <p className="mt-6 text-sm text-muted">
          Ödəniş PASHA Bank inteqrasiyası aktiv olduqda bu addımda ödəniş
          səhifəsinə yönləndiriləcəksiniz.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href={`/account/orders/${order.orderNumber}`}>
            Sifariş Detalları
          </Button>
          <Button href="/shop" variant="secondary">
            Alış-verişə Davam Et
          </Button>
        </div>
      </div>
    </Container>
  );
}
