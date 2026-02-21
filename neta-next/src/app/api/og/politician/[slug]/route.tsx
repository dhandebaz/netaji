import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { slug } = await context.params;
  const url = new URL(request.url);
  const origin = url.origin;

  const res = await fetch(`${origin}/open-data.json`, { cache: 'no-store' });
  const data = res.ok ? await res.json() : null;
  const politicians = (data && Array.isArray(data.politicians) ? data.politicians : []) as {
    name?: string;
    slug?: string;
    party?: string | null;
    state?: string | null;
    constituency?: string | null;
    approval_rating?: number | null;
    criminal_cases?: number | null;
  }[];

  const politician =
    politicians.find((p) => (p.slug || '').toLowerCase() === slug.toLowerCase()) ||
    politicians[0] ||
    null;

  const name = politician?.name || 'Neta';
  const party = politician?.party || '';
  const state = politician?.state || '';
  const constituency = politician?.constituency || '';
  const approval = typeof politician?.approval_rating === 'number' ? politician.approval_rating : null;
  const cases = typeof politician?.criminal_cases === 'number' ? politician.criminal_cases : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          background: 'radial-gradient(circle at top left, #1d4ed8, #020617)',
          color: '#e5e7eb',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.9 }}>Neta</div>
        <div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#f9fafb',
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 24,
              opacity: 0.9,
            }}
          >
            {[party, constituency, state].filter(Boolean).join(' • ')}
          </div>
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              gap: 24,
              fontSize: 20,
            }}
          >
            {approval !== null && (
              <div>
                <div style={{ opacity: 0.7 }}>Approval</div>
                <div style={{ fontWeight: 700 }}>{approval}%</div>
              </div>
            )}
            {cases !== null && (
              <div>
                <div style={{ opacity: 0.7 }}>Criminal cases</div>
                <div style={{ fontWeight: 700 }}>{cases}</div>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 18,
            opacity: 0.8,
          }}
        >
          <div>Know your leader. Shape your democracy.</div>
          <div>neta.ink</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

