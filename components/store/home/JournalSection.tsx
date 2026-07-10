import Link from "next/link";
import Container from "@/components/ui/Container";
import { journalEntries } from "@/lib/constants";

export default function JournalSection() {
  return (
    <section className="border-t border-border bg-secondary section-padding">
      <Container as="section">
        <div className="mb-12 flex items-center gap-6 lg:mb-14">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          <h2 className="text-display shrink-0 text-xl text-primary sm:text-2xl lg:text-3xl">
            Journal
          </h2>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {journalEntries.map((entry) => (
            <article key={entry.slug} className="group">
              <Link href={entry.href} className="block">
                <p className="text-eyebrow text-muted">{entry.date}</p>
                <h3 className="mt-4 text-lg font-light tracking-tight text-primary transition-colors group-hover:text-accent sm:text-xl">
                  {entry.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {entry.excerpt}
                </p>
                <p className="mt-5 text-xs font-medium tracking-[0.2em] uppercase text-primary transition-colors group-hover:text-accent">
                  Read →
                </p>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
