import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Qaytarılma və Ləğv Şərtləri",
  description: "Yapinci məhsullarının qaytarılması və sifarişin ləğvi şərtləri.",
};

const sections = [
  {
    title: "1. Qaytarılma şərtləri",
    list: [
      "Məhsul, çatdırılma tarixindən etibarən 14 gün ərzində geri qaytarıla bilər.",
      "Qaytarılan məhsul istifadə olunmamış, orijinal etiket və qablaşdırmada, satış zamanı olduğu vəziyyətdə olmalıdır.",
      "Qaytarılma üçün müştəri info@yapinci.az və ya +994 50 869 47 74 nömrəsi ilə əlaqə saxlamalıdır.",
    ],
  },
  {
    title: "2. Qaytarılma prosesi",
    body: "Müraciət təsdiqləndikdən sonra məhsul müştəri tərəfindən geri göndərilir və ya kuryer vasitəsilə geri götürülür. Məhsul yoxlanıldıqdan sonra ödəniş 5-7 iş günü ərzində geri qaytarılır.",
  },
  {
    title: "3. Sifarişin ləğvi",
    body: "Sifariş, kuryerə təhvil verilənə qədər (yəni çatdırılma prosesi başlamazdan əvvəl) müştəri tərəfindən ləğv edilə bilər. Sifariş artıq kuryerə təhvil verilibsə, ləğv əməliyyatı aparıla bilmir və məhsul yalnız qaytarılma qaydaları əsasında geri qaytarıla bilər.",
  },
  {
    title: "4. İstisnalar",
    body: "Fərdi sifariş (endirim, xüsusi sifariş) əsasında hazırlanmış məhsullar, gigiyenik səbəblərdən istifadə olunmuş məhsullar qaytarılma hüququna tabe deyil.",
  },
];

export default function ReturnPage() {
  return (
    <Container as="section" className="py-20 lg:py-28">
      <div className="max-w-3xl">
        <SectionHeader
          eyebrow="Hüquqi"
          title="Qaytarılma və Ləğv Şərtləri"
        />
        <p className="mt-4 text-xs uppercase tracking-[0.15em] text-muted">
          Son yenilənmə: [tarix]
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

