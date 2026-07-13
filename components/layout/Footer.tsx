import Link from "next/link";
import YapinciLogo from "@/components/brand/YapinciLogo";
import { brand, footerLinks, navLinks } from "@/lib/constants";
import { getStoreSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getStoreSettings();

  const socialLinks = [
    settings.instagram && { label: "Instagram", href: `https://instagram.com/${settings.instagram.replace(/^@/, "")}` },
    settings.facebook && { label: "Facebook", href: settings.facebook },
    settings.tiktok && { label: "TikTok", href: `https://tiktok.com/${settings.tiktok.replace(/^@/, "@")}` },
    settings.whatsapp && { label: "WhatsApp", href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="border-t border-border bg-primary text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <YapinciLogo variant="light" size="md" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">{brand.description}</p>
            <p className="mt-4 text-eyebrow text-accent">{brand.tagline}</p>
            {socialLinks.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-medium tracking-[0.15em] uppercase text-white/70 transition-all duration-300 hover:border-accent hover:text-white">
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <p className="text-eyebrow text-white/50">Shop</p>
            <ul className="mt-6 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/65 transition-colors duration-300 hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-eyebrow text-white/50">Company</p>
            <ul className="mt-6 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/65 transition-colors duration-300 hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-eyebrow text-white/50">Contact</p>
            <ul className="mt-6 space-y-3 text-sm text-white/65">
              <li>
                <a href={`mailto:${settings.email}`} className="transition-colors duration-300 hover:text-accent">
                  {settings.email}
                </a>
              </li>
              <li>
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="transition-colors duration-300 hover:text-accent">
                  {settings.phone}
                </a>
              </li>
              <li>{settings.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/45">© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-[10px] tracking-[0.15em] uppercase text-white/45 transition-colors duration-300 hover:text-accent">
                {link.label}
              </Link>
            ))}
            {footerLinks.legal.map((link) => (
              <Link key={link.label} href={link.href} className="text-[10px] tracking-[0.15em] uppercase text-white/45 transition-colors duration-300 hover:text-accent">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
