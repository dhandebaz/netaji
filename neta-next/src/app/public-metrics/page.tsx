import { headers } from 'next/headers';

type MetricsResponse = {
  totalVotes: number;
  aiBacklog: number;
};

async function fetchMetrics(): Promise<MetricsResponse | null> {
  try {
    const h = await headers();
    const host = h.get('host') || 'localhost:3000';
    const proto = h.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;

    const res = await fetch(`${baseUrl}/api/public/system-metrics`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as MetricsResponse;
  } catch {
    return null;
  }
}

export default async function PublicMetrics() {
  const data = await fetchMetrics();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-4">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          System Metrics
        </h1>
        {!data ? (
          <p className="text-sm text-slate-500">
            Metrics are currently unavailable.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Total Votes: <span className="font-semibold">{data.totalVotes}</span>
            </p>
            <p className="text-sm text-slate-600">
              AI Backlog:{' '}
              <span className="font-semibold">{data.aiBacklog}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
