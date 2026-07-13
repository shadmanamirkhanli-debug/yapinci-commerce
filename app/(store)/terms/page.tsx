import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "İstifadəçi Şərtləri",
  description: "Yapinci saytının istifadə şərtləri və qaydaları.",
};

const sections = [
  {
    title: "1. Məhsulun əldə olunması",
    body: "Saytımızda təqdim olunan bütün məhsullar (geyim və aksesuarlar) onlayn sifariş formu vasitəsilə əldə edilə bilər. Sifariş vermək üçün istifadəçi məhsulu səbətə əlavə edir, çatdırılma məlumatlarını daxil edir və ödənişi tamamlayır. Sifariş təsdiqləndikdən sonra müştəriyə e-mail vasitəsilə təsdiq bildirişi göndərilir.",
  },
  {
    title: "2. Çatdırılma şərtləri",
    list: [
      "Çatdırılma kuryer xidməti vasitəsilə həyata keçirilir.",
      "Çatdırılma müddəti sifarişin təsdiqindən etibarən 1-3 iş günüdür.",
      "Bakı şəhəri daxilində çatdırılma haqqı 3 AZN-dir.",
      "100 AZN və ondan yuxarı məbləğli sifarişlərdə çatdırılma pulsuzdur.",
      "Çatdırılma vaxtı bölgədən və ya xüsusi hallardan asılı olaraq dəyişə bilər.",
    ],
  },
  {
    title: "3. Ödəniş",
    body: "Ödənişlər sayt üzərindən bank kartı vasitəsilə və ya digər mövcud ödəniş üsulları ilə həyata keçirilir. Bütün ödənişlər təhlükəsiz ödəniş sistemi vasitəsilə emal olunur.",
  },
  {
    title: "4. Qiymətlər",
    body: "Saytda göstərilən bütün qiymətlər Azərbaycan manatı (AZN) ilədir və mövcud vergiləri əhatə edir. Qiymətlər əvvəlcədən xəbərdarlıq edilmədən dəyişdirilə bilər.",
  },
  {
    title: "5. Məsuliyyətin məhdudlaşdırılması",
    body: "Yapinci texniki nasazlıqlar, üçüncü tərəf xidmətlərindəki fasilələr və ya istifadəçinin öz səhvlərindən yaranan itkilərə görə məsuliyyət daşımır.",
  },
];

export default function TermsPage() {
  return (
    <Container as="section" className="py-20 lg:py-28">
      <div className="max-w-3xl">
        <SectionHeader
          eyebrow="Hüquqi"
          title="İstifadəçi Şərtləri və Qaydaları"
        />
        <p className="mt-4 text-xs uppercase tracking-[0.15em] text-muted">
          Son yenilənmə: [tarix]
        </p>

        <p className="mt-8 text-sm leading-relaxed text-muted sm:text-base">
          Bu şərtlər &quot;Yapinci&quot; (Fərdi Sahibkar, VÖEN: 6701935972)
          tərəfindən idarə olunan saytdan istifadə edən bütün müştərilərə
          şamil edilir. Saytdan istifadə etməklə siz aşağıdakı şərtləri qəbul
          etmiş sayılırsınız.
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
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

