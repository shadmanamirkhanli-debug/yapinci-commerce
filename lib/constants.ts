export const brand = {
  name: "Yapinci",
  wordmark: "YAPINCI",
  logo: "/brand/yapinci-logo.svg",
  tagline: "Premium Fashion",
  description:
    "Azərbaycan mədəniyyətindən ilham alan premium geyim brendi.",
  hero: {
    headline: "Wear the Story of Azerbaijan",
    subtitle:
      "Premium apparel inspired by Azerbaijani heritage and crafted for the modern world.",
    cta: "Explore Collection",
  },
  story: {
    eyebrow: "Heritage",
    title: "The Story Behind Every Symbol",
    paragraphs: [
      "Every motif in a Yapinci piece carries meaning — dragon scales for protection, pomegranate threads for abundance, geometric borders drawn from centuries of Caucasian craft.",
      "We study archives, speak with artisans, and distill symbolism into garments that feel contemporary, not costume. Each symbol is chosen with intention, then rendered with restraint.",
    ],
    cta: "Read Our Story",
  },
  craftsmanship: {
    eyebrow: "Craftsmanship",
    title: "Every Detail, Considered",
    paragraphs: [
      "From pattern to final stitch, our garments are developed in small batches with artisans who understand both heritage techniques and contemporary construction.",
      "Natural linens, refined wools, and responsibly sourced cottons are selected for longevity. Subtle embroidery and texture reference Azerbaijani artistry without spectacle — luxury that speaks softly.",
    ],
    highlights: [
      { label: "Artisan Made", detail: "Small-batch production" },
      { label: "Natural Fibres", detail: "Premium, traceable materials" },
      { label: "Timeless Design", detail: "Seasonless silhouettes" },
    ],
  },
  email: "info@yapinci.az",
  phone: "+994 12 345 67 89",
  address: "Bakı, Azərbaycan",
  instagram: "@yapinci.az",
} as const;

export const homeCollections = [
  {
    slug: "dragon",
    title: "Dragon Collection",
    description:
      "Ancient dragon motifs reimagined in modern silhouettes — strength, guardianship, and the spirit of the Caucasus.",
    productSlug: "dragon-talisman-tee-black",
    shopHref: "/shop?collection=Dragon",
  },
  {
    slug: "baku",
    title: "Baku Collection",
    description:
      "Urban elegance inspired by the Caspian coast — linen layers, soft structure, and the rhythm of the city.",
    productSlug: "baku-skyline-tee",
    shopHref: "/shop?collection=Baku",
  },
  {
    slug: "heritage-symbols",
    title: "Heritage Symbols",
    description:
      "Timeless emblems woven into premium fabrics — each piece a quiet conversation between past and present.",
    productSlug: "azerbaijan-vintage-cap",
    shopHref: "/shop?collection=Heritage",
  },
] as const;

export const journalEntries = [
  {
    slug: "symbols-of-the-caucasus",
    title: "Symbols of the Caucasus",
    excerpt:
      "How ancient motifs find their place in contemporary wardrobes without losing their meaning.",
    href: "/about",
    date: "March 2026",
  },
  {
    slug: "inside-the-atelier",
    title: "Inside the Atelier",
    excerpt:
      "A look at the artisans and techniques behind every Yapinci garment.",
    href: "/about",
    date: "February 2026",
  },
  {
    slug: "a-day-in-baku",
    title: "A Day in Baku",
    excerpt:
      "Morning light on the Caspian, evening in the old city — dressing for both worlds.",
    href: "/shop",
    date: "January 2026",
  },
] as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerLinks = {
  shop: [
    { label: "Bütün Məhsullar", href: "/shop" },
    { label: "Yeni Kolleksiya", href: "/shop" },
    { label: "Səbət", href: "/cart" },
  ],
  company: [
    { label: "Haqqımızda", href: "/about" },
    { label: "Əlaqə", href: "/contact" },
    { label: "Mağazalar", href: "/contact" },
  ],
  legal: [
    { label: "İstifadəçi Şərtləri", href: "/terms" },
    { label: "Məxfilik Siyasəti", href: "/privacy" },
    { label: "Qaytarılma və Ləğv", href: "/return" },
  ],
} as const;

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
