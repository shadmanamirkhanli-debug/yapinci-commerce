import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

type LegalSection = {
  title: string;
  highlight?: boolean;
  body?: string;
  list?: string[];
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Privacy");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("Privacy");
  const sections = t.raw("sections") as LegalSection[];

  return (
    <Container as="section" className="py-20 lg:py-28">
      <div className="max-w-3xl">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <p className="mt-4 text-xs uppercase tracking-[0.15em] text-muted">
          {t("lastUpdated")}
        </p>

        <p className="mt-8 text-sm leading-relaxed text-muted sm:text-base">
          {t("intro")}
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <div
              key={section.title}
              className={
                section.highlight
                  ? "rounded-2xl bg-secondary p-6"
                  : undefined
              }
            >
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-primary">
                {section.title}
              </h3>
              {section.body && (
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                  {section.body}
                </p>
              )}
              {section.list && (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

