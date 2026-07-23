import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";
import CarpetPattern from "@/components/ui/CarpetPattern";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("About");
  const locale = await getLocale();

  return createPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/about",
    locale,
  });
}

export default async function AboutPage() {
  const t = await getTranslations("About");
  const values = t.raw("values") as { title: string; description: string }[];

  return (
    <>
      <Container as="section" className="relative overflow-hidden py-20 lg:py-28">
        <CarpetPattern name="about-intro" />
        <div className="max-w-3xl">
          <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

          <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted sm:text-base">
            <p>{t("paragraph1")}</p>
            <p>{t("paragraph2")}</p>
            <p>{t("paragraph3")}</p>
          </div>

          <div className="mt-10 rounded-2xl bg-secondary p-6">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
              {t("officialInfoLabel")}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-primary">
              <li>
                {t("legalStatusLabel")}: {t("legalStatusValue")}
              </li>
              <li>
                {t("voenLabel")}: 6701935972
              </li>
              <li>
                {t("addressLabel")}: {t("addressFull")}
              </li>
            </ul>
          </div>

          <Button href="/shop" className="mt-10">
            {t("ctaShop")}
          </Button>

          <div className="mt-14 rounded-2xl bg-secondary p-6 sm:p-8">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
              {t("officialInfoLabel")}
            </p>
            <dl className="mt-4 space-y-2 text-sm text-primary">
              <div className="flex gap-2">
                <dt className="text-muted">{t("legalStatusLabel")}:</dt>
                <dd>{t("legalStatusValue")}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">{t("voenLabel")}:</dt>
                <dd>6701935972</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">{t("addressLabel")}:</dt>
                <dd>{t("addressShort")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>

      <section className="border-t border-border bg-secondary">
        <Container as="section" className="py-20 lg:py-28">
          <SectionHeader
            eyebrow={t("valuesEyebrow")}
            title={t("valuesTitle")}
            align="center"
            className="mb-14"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-lg"
              >
                <div className="mb-4 h-1 w-8 rounded-full bg-accent-secondary" />
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-primary">
                  {value.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
