import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import SessionProvider from "@/components/providers/SessionProvider";
import { getSeoSettings, ogLocaleFor } from "@/lib/seo/metadata";
import { getStoreSettings } from "@/lib/settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const locale = await getLocale();

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seo.metaTitle,
      template: "%s | " + seo.metaTitle,
    },
    description: seo.metaDescription,
    openGraph: {
      type: "website",
      locale: ogLocaleFor(locale),
      siteName: seo.metaTitle,
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await getStoreSettings();
  const locale = await getLocale();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: store.storeName,
    url: baseUrl,
    logo: store.logoUrl ? baseUrl + store.logoUrl : undefined,
    email: store.email,
    telephone: store.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: store.address,
    },
  };

  return (
    <html
      lang={locale}
      className={geistSans.variable + " " + geistMono.variable + " h-full antialiased"}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider>
          <SessionProvider>{children}</SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
