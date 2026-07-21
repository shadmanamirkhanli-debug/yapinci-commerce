/**
 * Canonical origin for customer-facing absolute URLs (redirects, emails,
 * Telegram admin links, SEO metadata). Must come from AUTH_URL, never from
 * `request.url` — this app is self-hosted behind nginx and Next.js only
 * trusts the incoming Host header when `experimental.trustHostHeader` is
 * set (it isn't), so route handlers otherwise fall back to the server's own
 * bind address (`localhost:3000`) regardless of what the client actually
 * requested.
 */
export function getBaseUrl(): string {
  const url = process.env.AUTH_URL;

  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_URL is not set. Customer-facing URLs cannot be built in production."
      );
    }
    return "http://localhost:3000";
  }

  return url.replace(/\/+$/, "");
}
