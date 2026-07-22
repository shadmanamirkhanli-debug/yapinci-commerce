import * as Sentry from "@sentry/nextjs";

// environment is intentionally omitted here: NEXT_PUBLIC_-less env vars
// aren't inlined into the client bundle, so this falls back to the SDK's
// NODE_ENV-based default, which already matches SENTRY_ENVIRONMENT in prod.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
