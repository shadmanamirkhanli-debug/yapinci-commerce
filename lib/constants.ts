export const brand = {
  name: "Yapinci",
  wordmark: "YAPINCI",
  logo: "/brand/yapinci-logo.svg",
  email: "info@yapinci.az",
  phone: "+994 12 345 67 89",
  address: "Bakı, Azərbaycan",
  instagram: "@yapinci.az",
} as const;

export const homeCollections = [
  {
    slug: "dragon",
    key: "dragon",
    productSlug: "dragon-talisman-tee-black",
    shopHref: "/shop?collection=Dragon",
  },
  {
    slug: "baku",
    key: "baku",
    productSlug: "baku-skyline-tee",
    shopHref: "/shop?collection=Baku",
  },
  {
    slug: "heritage-symbols",
    key: "heritageSymbols",
    productSlug: "azerbaijan-vintage-cap",
    shopHref: "/shop?collection=Heritage",
  },
] as const;

export const journalEntries = [
  {
    slug: "symbols-of-the-caucasus",
    key: "symbolsOfCaucasus",
    href: "/about",
  },
  {
    slug: "inside-the-atelier",
    key: "insideAtelier",
    href: "/about",
  },
  {
    slug: "a-day-in-baku",
    key: "aDayInBaku",
    href: "/shop",
  },
] as const;

export const navLinks = [
  { key: "home", href: "/" },
  { key: "shop", href: "/shop" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export const adminNavLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Coupons", href: "/admin/coupons" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Audit Log", href: "/admin/audit-log" },
  { label: "Payment Settings", href: "/admin/payment-settings" },
  { label: "Shipping Settings", href: "/admin/shipping-settings" },
  { label: "SEO Settings", href: "/admin/seo-settings" },
  { label: "Email Settings", href: "/admin/email-settings" },
  { label: "Settings", href: "/admin/settings" },
] as const;
