import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import CartPageClient from "@/components/store/CartPageClient";

export const metadata: Metadata = {
  title: "Cart",
  description: "Yapinci alış-veriş səbəti.",
};

export default function CartPage() {
  return (
    <Container as="section" className="py-16 lg:py-24">
      <CartPageClient />
    </Container>
  );
}
