"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="az">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <h1 className="font-serif text-2xl">Xəta baş verdi</h1>
        <p className="mt-4 max-w-md text-sm text-muted">
          Gözlənilməz bir xəta baş verdi. Komandamız bundan xəbərdar edildi.
        </p>
        <button
          onClick={() => unstable_retry()}
          className="mt-8 inline-flex h-12 items-center px-6 text-xs font-medium uppercase tracking-[0.15em] text-accent hover:underline"
        >
          Yenidən cəhd et
        </button>
      </body>
    </html>
  );
}
