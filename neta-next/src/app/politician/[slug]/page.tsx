import type { Metadata } from 'next';
import ProfileClient from './ProfileClient';
import { getPoliticianBySlugHandler } from '@/lib/politicians';
import { getSystemSettings } from '@/lib/admin/settings';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const [politician, settings] = await Promise.all([
    getPoliticianBySlugHandler({ tenant: null, slug }),
    getSystemSettings(),
  ]);
  const seo = (settings.seo || {}) as {
    defaultTitle?: string;
    defaultDescription?: string;
    allowIndexing?: boolean;
  };

  if (!politician) {
    return {
      title: seo.defaultTitle || 'Neta – Know Your Leader',
      description:
        seo.defaultDescription ||
        'Citizen dashboard for MPs and MLAs with verified criminal records, assets, RTI impact, and open data APIs.',
      robots: seo.allowIndexing === false ? { index: false, follow: false } : { index: true, follow: true },
    };
  }

  const pageTitle = `${politician.name} | Neta`;
  const description = `${politician.name}, ${politician.party}, ${politician.state}. Approval ${politician.approvalRating}%. Criminal cases: ${politician.criminalCases}.`;
  const canonicalUrl = `https://neta.ink/politician/${politician.slug}`;
  const ogImage = `https://neta.ink/api/og/politician/${politician.slug}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
      images: [ogImage],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [ogImage],
    },
    robots: seo.allowIndexing === false ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default function PoliticianPage({ params }: Props) {
  return <ProfileClient slug={params.slug} />;
}
