import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { brand } from "@/lib/constants";

export default function CraftsmanshipSection() {
  return (
    <section className="border-t border-border bg-secondary section-padding">
      <Container as="section">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow={brand.craftsmanship.eyebrow}
              title={brand.craftsmanship.title}
            />
          </div>
          <div className="space-y-8 lg:col-span-7">
            {brand.craftsmanship.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 24)}
                className="text-sm leading-relaxed text-muted sm:text-base"
              >
                {paragraph}
              </p>
            ))}
            <ul className="grid grid-cols-1 gap-6 border-t border-border pt-8 sm:grid-cols-3">
              {brand.craftsmanship.highlights.map((item) => (
                <li key={item.label} className="group">
                  <p className="text-eyebrow text-accent">{item.label}</p>
                  <p className="mt-2 text-sm text-muted transition-colors group-hover:text-primary">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
