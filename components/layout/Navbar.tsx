"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand, navLinks } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import NavbarAuth from "@/components/layout/NavbarAuth";
import { useCart } from "@/components/providers/CartProvider";

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count: cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:h-20 lg:px-10">
        <Link
          href="/"
          className="text-lg font-medium tracking-[0.35em] uppercase text-primary transition-opacity duration-300 hover:opacity-70 lg:text-xl"
        >
          {brand.name}
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-300",
                  isActive
                    ? "text-primary"
                    : "text-muted hover:text-primary"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-px w-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <form
            className="hidden lg:block"
            onSubmit={(event) => {
              event.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Axtar..."
              aria-label="Məhsul axtar"
              className="h-10 w-44 rounded-full border border-border bg-background px-4 text-xs tracking-wide outline-none transition-colors focus:border-accent xl:w-52"
            />
          </form>

          <NavbarAuth className="hidden md:inline-flex" />

          <Link
            href="/cart"
            aria-label="Səbət"
            className="relative rounded-full p-2 text-primary transition-all duration-300 hover:bg-secondary"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-medium text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Menyunu bağla" : "Menyunu aç"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 hover:bg-secondary md:hidden"
          >
            <span className="relative h-3 w-5">
              <span
                className={cn(
                  "absolute left-0 block h-px w-5 bg-primary transition-all duration-300",
                  mobileOpen ? "top-1.5 rotate-45" : "top-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 block h-px w-5 bg-primary transition-all duration-300",
                  mobileOpen ? "opacity-0" : "opacity-100"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-px w-5 bg-primary transition-all duration-300",
                  mobileOpen ? "top-1.5 -rotate-45" : "top-3"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <nav
        className={cn(
          "overflow-hidden border-t border-border/60 transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          <div className="mb-2 px-4">
            <NavbarAuth />
          </div>
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-300",
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted hover:bg-secondary hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
