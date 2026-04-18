// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://3f59da7885892008a20fdec4f2762609@o4511239804420096.ingest.de.sentry.io/4511239812743248",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  integrations:[
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),
    Sentry.consoleLoggingIntegration({
      levels: ["error", "warn", "log", "info", "debug", "trace"]
    })
  ],

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
