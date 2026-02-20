import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';
import { initSSE } from './services/eventBus';
import { HelmetProvider } from 'react-helmet-async';
import * as webVitals from 'web-vitals';
import { sendToAnalytics } from './services/webVitalsReporter';

initSSE();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  (window as any).requestIdleCallback(() => {
    webVitals.onCLS(sendToAnalytics);
    webVitals.onFID(sendToAnalytics);
    webVitals.onLCP(sendToAnalytics);
  });
} else {
  webVitals.onCLS(sendToAnalytics);
  webVitals.onFID(sendToAnalytics);
  webVitals.onLCP(sendToAnalytics);
}
