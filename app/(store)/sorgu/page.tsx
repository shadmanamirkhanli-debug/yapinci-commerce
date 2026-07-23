import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import CarpetPattern from "@/components/ui/CarpetPattern";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import SurveyClient from "@/components/store/SurveyClient";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Survey");
  const locale = await getLocale();

  return createPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/sorgu",
    noIndex: true,
    locale,
  });
}

export default async function SurveyPage() {
  const t = await getTranslations("Survey");

  return (
    <Container as="section" className="relative overflow-hidden py-20 lg:py-28">
      <CarpetPattern name="sorgu" />
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        align="center"
        className="mx-auto max-w-2xl"
      />
      <div className="mt-12">
        <SurveyClient />
      </div>
    </Container>
  );
}
