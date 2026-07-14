import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import CartPageClient from "@/components/store/CartPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cart");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function CartPage() {
  return (
    <Container as="section" className="py-16 lg:py-24">
      <CartPageClient />
    </Container>
  );
}
