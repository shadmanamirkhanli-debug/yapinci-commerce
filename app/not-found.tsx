import Link from "next/link";

// Fallback for paths outside app/[locale] (e.g. malformed URLs that never
// reach the locale segment). The localized 404 lives at app/[locale]/not-found.tsx.
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
        404
      </p>
      <h1 className="font-serif text-3xl text-foreground">Page not found</h1>
      <Link
        href="/"
        className="inline-flex h-12 items-center px-6 text-xs font-medium uppercase tracking-[0.15em] text-accent hover:underline"
      >
        Back home
      </Link>
    </div>
  );
}
