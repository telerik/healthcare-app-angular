import { Injectable } from '@angular/core';
import { Attributes, Span, SpanStatusCode, trace } from '@opentelemetry/api';
import { TRACER_NAME } from './tracing';

/**
 * Application span kinds, mirroring the four semantic roles the Progress
 * Observability skills use. They describe what a span represents so the
 * platform can group traces consistently.
 */
export type AppSpanKind = 'workflow' | 'task' | 'agent' | 'tool';

/**
 * Thin wrapper over the OpenTelemetry tracer that adds app-level spans with a
 * consistent `app.span.kind` attribute and uniform error/status handling.
 *
 * Use this for spans that describe application behaviour (a user interaction, a
 * data lookup). Low-level document-load, fetch, XHR and user-interaction spans
 * are produced automatically by the registered auto-instrumentations.
 */
@Injectable({ providedIn: 'root' })
export class TracingService {
  private readonly tracer = trace.getTracer(TRACER_NAME);

  /**
   * Run `fn` inside an active span, recording exceptions and setting status.
   *
   * The span is active for the duration of `fn`, so any spans created within it
   * (including auto-instrumentation spans) are parented correctly. Works for
   * both synchronous and promise-returning functions.
   */
  run<T>(name: string, kind: AppSpanKind, fn: (span: Span) => T, attributes?: Attributes): T {
    return this.tracer.startActiveSpan(
      name,
      { attributes: { 'app.span.kind': kind, ...attributes } },
      (span) => {
        try {
          const result = fn(span);
          if (result instanceof Promise) {
            return result
              .then((value) => {
                span.setStatus({ code: SpanStatusCode.OK });
                return value;
              })
              .catch((error: unknown) => {
                this.recordError(span, error);
                throw error;
              })
              .finally(() => span.end()) as T;
          }
          span.setStatus({ code: SpanStatusCode.OK });
          span.end();
          return result;
        } catch (error) {
          this.recordError(span, error);
          span.end();
          throw error;
        }
      },
    );
  }

  private recordError(span: Span, error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  }
}
