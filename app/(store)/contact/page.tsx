import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Input from "@/components/ui/Input";
import SectionHeader from "@/components/ui/SectionHeader";
import Textarea from "@/components/ui/Textarea";
import { getStoreSettings } from "@/lib/settings";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Contact");
  const locale = await getLocale();

  return createPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/contact",
    locale,
  });
}

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const t = await getTranslations("Contact");

  const contactInfo = [
    { label: t("emailLabel"), value: settings.email, href: `mailto:${settings.email}` },
    { label: t("phoneLabel"), value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { label: t("addressLabel"), value: settings.address },
  ];

  return (
    <Container as="section" className="py-20 lg:py-28">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <ul className="mt-12 space-y-6">
            {contactInfo.map((item) => (
              <li key={item.label}>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="mt-1 block text-sm text-primary transition-colors duration-300 hover:text-accent">
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-primary">{item.value}</p>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-12 rounded-2xl bg-secondary p-6">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted">{t("hoursHeading")}</p>
            <p className="mt-2 text-sm text-primary">{t("hoursWeekday")}</p>
            <p className="text-sm text-muted">{t("hoursSaturday")}</p>
          </div>
        </div>
        <form className="rounded-3xl border border-border bg-white p-8 shadow-sm lg:p-10">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-primary">{t("formHeading")}</h2>
          <div className="mt-8 space-y-5">
            <Input label={t("nameFieldLabel")} name="name" placeholder={t("namePlaceholder")} required />
            <Input label={t("emailLabel")} name="email" type="email" placeholder="email@example.com" required />
            <Textarea label={t("messageFieldLabel")} name="message" rows={5} placeholder={t("messagePlaceholder")} required />
            <Button type="submit" className="w-full sm:w-auto">{t("submitCta")}</Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
