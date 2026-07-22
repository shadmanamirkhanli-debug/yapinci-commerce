import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384],
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  // SENTRY_AUTH_TOKEN isn't configured yet. Once it is, drop this block
  // (and set SENTRY_ORG / SENTRY_PROJECT) to enable source map upload.
  sourcemaps: {
    disable: true,
  },
});
