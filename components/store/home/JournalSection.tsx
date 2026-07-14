import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import CarpetPattern from "@/components/ui/CarpetPattern";
import Container from "@/components/ui/Container";
import { journalEntries } from "@/lib/constants";

export default function JournalSection() {
  const t = useTranslations("JournalSection");

  return (
    <section className="relative overflow-hidden border-t border-border bg-secondary section-padding">
      <CarpetPattern name="journal" />
      <Container as="section">
        <div className="mb-12 flex items-center gap-6 lg:mb-14">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          <h2 className="text-display shrink-0 text-xl text-primary sm:text-2xl lg:text-3xl">
            {t("heading")}
          </h2>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {journalEntries.map((entry) => (
            <article key={entry.slug} className="group">
              <Link href={entry.href} className="block">
                <p className="text-eyebrow text-muted">{t(`entries.${entry.key}.date`)}</p>
                <h3 className="mt-4 text-lg font-light tracking-tight text-primary transition-colors group-hover:text-accent sm:text-xl">
                  {t(`entries.${entry.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t(`entries.${entry.key}.excerpt`)}
                </p>
                <p className="mt-5 text-xs font-medium tracking-[0.2em] uppercase text-primary transition-colors group-hover:text-accent">
                  {t("readCta")} →
                </p>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
