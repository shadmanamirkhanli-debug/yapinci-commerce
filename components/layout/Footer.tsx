import Link from "next/link";
import YapinciLogo from "@/components/brand/YapinciLogo";
import { brand, footerLinks, navLinks } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <YapinciLogo variant="light" size="md" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">
              {brand.description}
            </p>
            <p className="mt-4 text-eyebrow text-accent">{brand.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Instagram", "Facebook", "Pinterest"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-medium tracking-[0.15em] uppercase text-white/70 transition-all duration-300 hover:border-accent hover:text-white"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="text-eyebrow text-white/50">Shop</p>
            <ul className="mt-6 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 transition-colors duration-300 hover:text-accent"
                  >
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
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 transition-colors duration-300 hover:text-accent"
                  >
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
                <a
                  href={`mailto:${brand.email}`}
                  className="transition-colors duration-300 hover:text-accent"
                >
                  {brand.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${brand.phone.replace(/\s/g, "")}`}
                  className="transition-colors duration-300 hover:text-accent"
                >
                  {brand.phone}
                </a>
              </li>
              <li>{brand.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[10px] tracking-[0.15em] uppercase text-white/45 transition-colors duration-300 hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
