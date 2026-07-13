import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function BrandStorySection() {
  const t = useTranslations("Brand");
  const paragraphs = t.raw("story.paragraphs") as string[];

  return (
    <section className="border-t border-border bg-background section-padding">
      <Container as="section">
        <div className="mb-12 flex items-center gap-6 lg:mb-14">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          <h2 className="text-display shrink-0 text-center text-xl text-primary sm:text-2xl lg:text-3xl">
            {t("story.title")}
          </h2>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <div className="mx-auto max-w-3xl space-y-6 text-center text-sm leading-relaxed text-muted sm:text-base">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <div className="pt-4">
            <Button href="/about" variant="ghost" size="sm">
              {t("story.cta")} →
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
