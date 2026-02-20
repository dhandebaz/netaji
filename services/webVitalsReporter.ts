import { ReportHandler } from 'web-vitals';

export const sendToAnalytics: ReportHandler = (metric) => {
  try {
    const body = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
      navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'navigate',
    };

    navigator.sendBeacon('/api/performance-log', JSON.stringify(body));
  } catch {}
};

