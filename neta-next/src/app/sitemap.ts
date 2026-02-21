import type { MetadataRoute } from 'next';

export const runtime = 'edge';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://neta.ink';

  return [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/open-data`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/complaints`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/maps`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/games`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/rti-guidelines`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/volunteer`, changeFrequency: 'weekly', priority: 0.5 },
  ];
}
