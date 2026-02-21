import type { MetadataRoute } from 'next';

export const runtime = 'edge';

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: '/',
      disallow: '',
    },
  ];

  return {
    rules,
    sitemap: 'https://neta.ink/sitemap.xml',
  };
}
