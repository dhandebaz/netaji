import { headers } from 'next/headers';

type StateHealth = {
  state: string;
  healthScore: number;
};

type SystemHealthResponse = {
  stats: {
    stateHealth?: StateHealth[];
  };
};

async function fetchSystemHealth(): Promise<SystemHealthResponse | null> {
  try {
    const h = await headers();
    const host = h.get('host') || 'localhost:3000';
    const proto = h.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;

    const res = await fetch(`${baseUrl}/api/public/system-health`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as SystemHealthResponse;
  } catch {
    return null;
  }
}

export default async function RankingPage() {
  const data = await fetchSystemHealth();
  const states = data?.stats.stateHealth ?? [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-4">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          State Governance Ranking
        </h1>
        {states.length === 0 ? (
          <p className="text-sm text-slate-500">No state health data available.</p>
        ) : (
          <div className="space-y-2">
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
      </div>
    </div>
  );
}

