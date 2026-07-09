import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Input from "@/components/ui/Input";
import SectionHeader from "@/components/ui/SectionHeader";
import Textarea from "@/components/ui/Textarea";
import { brand } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Yapinci ilə əlaqə saxlayın — suallar, təkliflər və əməkdaşlıq.",
};

const contactInfo = [
  { label: "E-poçt", value: brand.email, href: `mailto:${brand.email}` },
  { label: "Telefon", value: brand.phone, href: `tel:${brand.phone.replace(/\s/g, "")}` },
  { label: "Ünvan", value: brand.address },
];

export default function ContactPage() {
  return (
    <Container as="section" className="py-20 lg:py-28">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeader
            eyebrow="Əlaqə"
            title="Bizimlə Əlaqə"
            description="Suallarınız, təklifləriniz və ya əməkdaşlıq üçün bizimlə əlaqə saxlayın."
          />

          <ul className="mt-12 space-y-6">
            {contactInfo.map((item) => (
              <li key={item.label}>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1 block text-sm text-primary transition-colors duration-300 hover:text-accent"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-primary">{item.value}</p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-2xl bg-secondary p-6">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
              İş Saatları
            </p>
            <p className="mt-2 text-sm text-primary">
              Bazar ertəsi – Cümə: 10:00 – 19:00
            </p>
            <p className="text-sm text-muted">Şənbə: 11:00 – 17:00</p>
          </div>
        </div>

        <form className="rounded-3xl border border-border bg-white p-8 shadow-sm lg:p-10">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-primary">
            Mesaj Göndərin
          </h2>
          <div className="mt-8 space-y-5">
            <Input label="Ad, Soyad" name="name" placeholder="Adınızı daxil edin" required />
            <Input
              label="E-poçt"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
            />
            <Textarea
              label="Mesaj"
              name="message"
              rows={5}
              placeholder="Mesajınızı yazın..."
              required
            />
            <Button type="submit" className="w-full sm:w-auto">
              Göndər
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
