import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "About",
  description: "Yapinci haqqında — Azərbaycan mədəniyyətindən ilham alan premium geyim brendi.",
};

const values = [
  {
    title: "Keyfiyyət",
    description:
      "Hər parça ən yüksək standartlarda, təbii parçalardan və əl işi detallarla hazırlanır.",
  },
  {
    title: "Mədəniyyət",
    description:
      "Azərbaycanın zəngin mədəni irsi müasir dizayn dilində yenidən yorumlanır.",
  },
  {
    title: "Davamlılıq",
    description:
      "Uzunömürlü geyim yaradırıq — trendlərdən kənar, zamansız parçalar.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Container as="section" className="py-20 lg:py-28">
        <div className="max-w-3xl">
          <SectionHeader eyebrow="Haqqımızda" title="About Yapinci" />

          <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted sm:text-base">
            <p>
              Yapinci — Azərbaycanın zəngin mədəni irsinə hörmət edən, müasir
              dünyanın tələblərinə cavab verən premium geyim brendidir. Hər
              kolleksiya ənənəvi naxışlar, təbii parçalar və minimalist
              estetikanın harmoniyasını əks etdirir.
            </p>
            <p>
              Biz inanırıq ki, geyim yalnız funksional deyil — o, kimliyin və
              mədəniyyətin ifadəsidir. Hər parça diqqətlə seçilmiş parçalar,
              əl işi detallar və davamlı istehsal prinsipləri ilə hazırlanır.
            </p>
            <p>
              Yapinci Commerce platforması brendimizin rəqəmsal üzüdür — burada
              kolleksiyalarımızı kəşf edə, sifariş verə və premium alış-veriş
              təcrübəsindən həzz ala bilərsiniz.
            </p>
          </div>

          <Button href="/shop" className="mt-10">
            Kolleksiyaya Bax
          </Button>
        </div>
      </Container>

      <section className="border-t border-border bg-secondary">
        <Container as="section" className="py-20 lg:py-28">
          <SectionHeader
            eyebrow="Dəyərlərimiz"
            title="Nə Üçün Yapinci"
            align="center"
            className="mb-14"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-lg"
              >
                <div className="mb-4 h-1 w-8 rounded-full bg-accent" />
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
