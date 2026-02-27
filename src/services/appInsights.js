/**
 * Azure Application Insights – client-side telemetry
 *
 * Initialises the Application Insights SDK with adaptive sampling to keep
 * ingestion volume (and cost) low.  Exports a pre-configured client and
 * thin helper wrappers.
 *
 * Usage:
 *   import { trackEvent, trackError, trackPageView } from "@/services/appInsights";
 *
 *   trackPageView({ name: "CaregiverDashboard" });
 *   trackEvent("photo_uploaded", { size: file.size });
 *   trackError(new Error("Something went wrong"));
 */

import azureConfig from "@/config/azure.config";

// ---------------------------------------------------------------------------
// Lazy-initialise the SDK so it does not block the initial render
// ---------------------------------------------------------------------------
let appInsights = null;

async function getClient() {
  if (appInsights) return appInsights;

  const { connectionString } = azureConfig.appInsights;
  if (!connectionString) return null;

  const { ApplicationInsights } = await import(
    /* webpackChunkName: "app-insights" */
    "@microsoft/applicationinsights-web"
  );

  const client = new ApplicationInsights({
    config: {
      connectionString,
      // Adaptive sampling – send at most 10 % of telemetry when under load
      samplingPercentage: 10,
      // Disable automatic page-view tracking; we call trackPageView manually
      disableFetchTracking: false,
      enableAutoRouteTracking: false,
      // Reduce storage footprint
      maxBatchSizeInBytes: 102400,
      maxBatchInterval: 15000,
    },
  });

  client.loadAppInsights();
  appInsights = client;
  return client;
}

// Initialise eagerly in the browser (fire-and-forget)
if (typeof window !== "undefined") {
  getClient().catch(() => {
    // Non-fatal: telemetry is best-effort
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Track a custom event.
 *
 * @param {string}                   name       - Event name.
 * @param {Record<string, unknown>} [properties] - Custom dimensions.
 */
export async function trackEvent(name, properties = {}) {
  const client = await getClient();
  client?.trackEvent({ name }, properties);
}

/**
 * Track a page view.
 *
 * @param {{ name?: string; uri?: string }} [options]
 */
export async function trackPageView(options = {}) {
  const client = await getClient();
  client?.trackPageView(options);
}

/**
 * Track an exception.
 *
 * @param {Error}                    error
 * @param {Record<string, unknown>} [properties]
 */
export async function trackError(error, properties = {}) {
  const client = await getClient();
  client?.trackException({ exception: error }, properties);
}

/**
 * Track a metric value.
 *
 * @param {string} name
 * @param {number} value
 */
export async function trackMetric(name, value) {
  const client = await getClient();
  client?.trackMetric({ name, average: value });
}

/**
 * Add a telemetry initialiser to enrich all events with shared properties
 * (e.g. authenticated user ID).
 *
 * @param {Function} initialiser
 */
export async function addTelemetryInitializer(initialiser) {
  const client = await getClient();
  client?.addTelemetryInitializer(initialiser);
}
