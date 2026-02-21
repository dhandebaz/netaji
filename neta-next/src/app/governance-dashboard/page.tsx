import { headers } from 'next/headers';

type StateHealth = {
  state: string;
  healthScore: number;
};

type SystemHealthResponse = {
  healthScore: number;
  stats: {
    voteAnomalies: number;
    governanceStability: number;
    healthDrift?: number;
    stateHealth?: StateHealth[];
  };
  hash: string;
};

type MetricsResponse = {
  totalVotes: number;
  aiBacklog: number;
};

type AnchorResponse = {
  latest: {
    hash: string;
    created_at: string;
  } | null;
};

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const h = await headers();
    const host = h.get('host') || 'localhost:3000';
    const proto = h.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;

    const res = await fetch(`${baseUrl}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function GovernanceDashboardPage() {
  const [health, metrics, anchor] = await Promise.all([
    fetchJson<SystemHealthResponse>('/api/public/system-health'),
    fetchJson<MetricsResponse>('/api/public/system-metrics'),
    fetchJson<AnchorResponse>('/api/public/verify-anchor'),
  ]);

  const states = health?.stats.stateHealth ?? [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Governance Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Read-only governance health, stability, anomalies, and anchors. No user data, only
            aggregated system telemetry.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Health Score</p>
            <p className="text-2xl font-black text-slate-900">
              {health ? health.healthScore : '–'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Governance Stability
            </p>
            <p className="text-2xl font-black text-slate-900">
              {health ? health.stats.governanceStability : '–'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Vote Anomalies</p>
            <p className="text-2xl font-black text-slate-900">
              {health ? health.stats.voteAnomalies : '–'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Health Drift</p>
            <p className="text-2xl font-black text-slate-900">
              {health && typeof health.stats.healthDrift === 'number'
                ? health.stats.healthDrift
                : '–'}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Votes</p>
            <p className="text-2xl font-black text-slate-900">
              {metrics ? metrics.totalVotes : '–'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">AI Backlog</p>
            <p className="text-2xl font-black text-slate-900">
              {metrics ? metrics.aiBacklog : '–'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Latest Anchor Hash</p>
            <p className="text-xs font-mono break-all text-slate-800">
              {anchor?.latest?.hash || health?.hash || 'No anchor yet'}
            </p>
            {anchor?.latest?.created_at && (
              <p className="text-[11px] text-slate-500">
                Anchored at {new Date(anchor.latest.created_at).toLocaleString()}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              State Ranking
            </h2>
          </div>
          {states.length === 0 ? (
            <p className="text-sm text-slate-500">No state health data available.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {states.map((s) => (
                <div
                  key={s.state}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span className="font-medium">{s.state}</span>
                  <span className="font-semibold">{s.healthScore}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="pt-2 border-t border-slate-200 mt-4">
          <p className="text-[11px] text-slate-500">
            This dashboard is fully read-only and only consumes public aggregation endpoints. It
            exposes no user identities or secrets.
          </p>
        </footer>
      </div>
    </div>
  );
}

