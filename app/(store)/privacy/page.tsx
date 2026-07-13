import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Məxfilik Siyasəti",
  description: "Yapinci saytında istifadəçi məlumatlarının qorunması siyasəti.",
};

const sections = [
  {
    title: "1. Toplanan məlumatlar",
    body: "Sifariş prosesi zamanı aşağıdakı məlumatlar toplanır:",
    list: ["Ad və soyad", "Elektron poçt ünvanı", "Əlaqə telefon nömrəsi (çatdırılma üçün)", "Çatdırılma ünvanı"],
  },
  {
    title: "2. Kart məlumatları",
    highlight: true,
    body: "Bank kartı məlumatları (kart nömrəsi, son istifadə tarixi, CVV kodu) heç bir halda saytımızın serverlərində saxlanılmır. Ödənişlər lisenziyalı ödəniş provayderinin təhlükəsiz sistemi vasitəsilə birbaşa emal olunur və Yapinci bu məlumatlara çıxış əldə etmir və saxlamır.",
  },
  {
    title: "3. Məlumatların istifadəsi",
    body: "Toplanan məlumatlar yalnız aşağıdakı məqsədlər üçün istifadə olunur:",
    list: ["Sifarişin icrası və çatdırılması", "Müştəri ilə əlaqə saxlanılması", "Sifariş statusu haqqında bildirişlərin göndərilməsi"],
  },
  {
    title: "4. Məlumatların üçüncü tərəflərlə paylaşılması",
    body: "Müştəri məlumatları, çatdırılma prosesini həyata keçirən kuryer xidməti istisna olmaqla, üçüncü tərəflərlə paylaşılmır və ya satılmır.",
  },
  {
    title: "5. Məlumatların qorunması",
    body: "Toplanan bütün şəxsi məlumatlar müvafiq texniki tədbirlərlə qorunur və yalnız məqsədəuyğun müddət ərzində saxlanılır.",
  },
  {
    title: "6. İstifadəçinin hüquqları",
    body: "İstənilən müştəri öz şəxsi məlumatlarının silinməsini və ya düzəldilməsini info@yapinci.az ünvanına müraciət edərək tələb edə bilər.",
  },
];

export default function PrivacyPage() {
  return (
    <Container as="section" className="py-20 lg:py-28">
      <div className="max-w-3xl">
        <SectionHeader eyebrow="Hüquqi" title="Məxfilik Siyasəti" />
        <p className="mt-4 text-xs uppercase tracking-[0.15em] text-muted">
          Son yenilənmə: [tarix]
        </p>

        <p className="mt-8 text-sm leading-relaxed text-muted sm:text-base">
          Yapinci olaraq müştərilərimizin şəxsi məlumatlarının qorunmasına
          böyük önəm veririk. Bu sənəd hansı məlumatların toplandığını və necə
          istifadə olunduğunu izah edir.
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

