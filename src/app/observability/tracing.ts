import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

/**
 * Runtime configuration for browser tracing.
 *
 * Provided at runtime via `window.__OTEL_CONFIG__` (for example, injected by a
 * deployment-time script or a `<script>` block in `index.html`), so the
 * collector endpoint and any auth headers can change per environment — dev,
 * staging, prod — without rebuilding the app. Secrets are never hardcoded here.
 */
export interface OtelRuntimeConfig {
  /** Stable platform identity for this app. Filters key off this value. */
  serviceName?: string;
  /** OTLP/HTTP traces endpoint of a collector reachable from the browser. */
  collectorUrl?: string;
  /** Optional headers (for example, an API key) sent with every export. */
  headers?: Record<string, string>;
  /** Set to `false` to disable tracing entirely. Defaults to `true`. */
  enabled?: boolean;
}

declare global {
  interface Window {
    __OTEL_CONFIG__?: OtelRuntimeConfig;
  }
}

/** Name reported to the OpenTelemetry API when acquiring the tracer. */
export const TRACER_NAME = 'healthcare-app';

const DEFAULT_SERVICE_NAME = 'healthcare-app-angular';
const DEFAULT_COLLECTOR_URL = 'http://localhost:4318/v1/traces';

let initialized = false;

/**
 * Initialise browser tracing for the Angular SPA.
 *
 * Must run before the Angular application bootstraps so that the
 * `ZoneContextManager` and the auto-instrumentations are registered ahead of
 * the first document load and user interaction. Safe to call more than once —
 * subsequent calls are ignored.
 */
export function initTracing(): void {
  if (initialized) {
    return;
  }
  if (typeof window === 'undefined') {
    // No browser context (should not happen for this SPA) — nothing to trace.
    return;
  }

  const config: OtelRuntimeConfig = window.__OTEL_CONFIG__ ?? {};

  if (config.enabled === false) {
    // Explicitly disabled — make the choice visible rather than silent.
    console.info('[observability] Tracing is disabled via window.__OTEL_CONFIG__.enabled=false');
    initialized = true;
    return;
  }

  const serviceName = config.serviceName ?? DEFAULT_SERVICE_NAME;
  const collectorUrl = config.collectorUrl ?? DEFAULT_COLLECTOR_URL;

  if (!window.__OTEL_CONFIG__) {
    // A missing config is loud, not silent: the app still exports, but the
    // developer is told which defaults are in effect and where spans are going.
    console.warn(
      `[observability] window.__OTEL_CONFIG__ not found. Using defaults: ` +
        `service="${serviceName}", collector="${collectorUrl}". ` +
        `Set window.__OTEL_CONFIG__ in index.html to override.`,
    );
  }

  const exporter = new OTLPTraceExporter({
    url: collectorUrl,
    headers: config.headers,
  });

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: '0.0.0',
    }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  // The app runs Angular with zone.js, so the zone-based context manager keeps
  // spans correctly parented across async boundaries (setTimeout, promises).
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation(),
      new FetchInstrumentation(),
      new XMLHttpRequestInstrumentation(),
    ],
  });

  // Flush any buffered spans on tab close so short sessions are not lost.
  window.addEventListener('pagehide', () => {
    void provider.forceFlush();
  });

  initialized = true;

  console.info(
    `[observability] Tracing initialised for service="${serviceName}" → ${collectorUrl}`,
  );
}
