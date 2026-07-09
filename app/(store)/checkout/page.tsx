import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import CheckoutWizard from "@/components/checkout/CheckoutWizard";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Yapinci sifarişinizi tamamlayın.",
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <Container as="section" className="py-16 lg:py-24">
      <SectionHeader
        eyebrow="Ödəniş"
        title="Checkout"
        description="4 addımlı təhlükəsiz sifariş prosesi"
        className="mb-12"
      />
      <CheckoutWizard defaultEmail={session.user.email ?? undefined} />
    </Container>
  );
}
