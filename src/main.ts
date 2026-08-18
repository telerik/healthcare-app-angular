/// <reference types="@angular/localize" />

import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initTracing } from './app/observability/tracing';

// Initialise browser tracing before the app bootstraps so document-load and
// user-interaction spans are captured from the first paint.
initTracing();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
