import Link from "next/link";
import { brand, footerLinks, navLinks } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-lg font-medium tracking-[0.35em] uppercase text-primary">
              {brand.name}
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              {brand.description}
            </p>
            <div className="mt-8 flex gap-4">
              {["Instagram", "Facebook", "Pinterest"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="rounded-full border border-border px-4 py-2 text-[10px] font-medium tracking-[0.15em] uppercase text-muted transition-all duration-300 hover:border-accent hover:text-primary"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
              Mağaza
            </p>
            <ul className="mt-5 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-300 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
              Şirkət
            </p>
            <ul className="mt-5 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-300 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
              Əlaqə
            </p>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="transition-colors duration-300 hover:text-primary"
                >
                  {brand.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${brand.phone.replace(/\s/g, "")}`}
                  className="transition-colors duration-300 hover:text-primary"
                >
                  {brand.phone}
                </a>
              </li>
              <li>{brand.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-2xl bg-secondary px-6 py-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {brand.name} Commerce. Bütün hüquqlar
            qorunur.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[10px] tracking-[0.15em] uppercase text-muted transition-colors duration-300 hover:text-primary"
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
