import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import CheckoutWizard from "@/components/checkout/CheckoutWizard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Checkout");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const t = await getTranslations("Checkout");

  return (
    <Container as="section" className="py-16 lg:py-24">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        className="mb-12"
      />
      <CheckoutWizard defaultEmail={session.user.email ?? undefined} />
    </Container>
  );
}
