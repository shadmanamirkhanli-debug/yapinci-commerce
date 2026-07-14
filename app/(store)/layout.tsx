import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/components/providers/CartProvider";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("StoreLayout");

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-background"
        >
          {t("skipToContent")}
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
