export const brand = {
  name: "Yapinci",
  tagline: "Premium Fashion",
  description:
    "Azərbaycan mədəniyyətindən ilham alan premium geyim brendi.",
  email: "info@yapinci.az",
  phone: "+994 12 345 67 89",
  address: "Bakı, Azərbaycan",
} as const;

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
  { label: "Settings", href: "/admin/settings" },
] as const;
