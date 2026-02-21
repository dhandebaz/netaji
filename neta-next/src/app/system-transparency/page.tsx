import { headers } from 'next/headers';

type PublicHealthResponse = {
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  issues: { code: string; severity: 'low' | 'medium' | 'high'; message: string }[];
  stats: {
    pendingAI: number;
    voteAnomalies: number;
    staleProfiles: number;
    governanceStability?: number;
    projectedStability?: number;
    healthDrift?: number;
    stateHealth?: {
      state: string;
      healthScore: number;
    }[];
  };
  generatedAt: string;
  hash: string;
};

async function fetchPublicHealth(): Promise<PublicHealthResponse | null> {
  const h = await headers();
  const host = h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || 'http';
  const baseUrl = `${proto}://${host}`;
  try {
    const res = await fetch(`${baseUrl}/api/public/system-health`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicHealthResponse;
  } catch {
    return null;
  }
}

export default async function SystemTransparencyPage() {
  const data = await fetchPublicHealth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
            Public Integrity Feed
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            System Transparency
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            This endpoint exposes a cryptographically signed snapshot of Neta OS system health. No
            secrets. No identities. Only infrastructure integrity.
          </p>
        </header>

        {!data ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
            Unable to fetch system health. The transparency feed may be temporarily offline.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                  Health Score
                </p>
                <p className="text-4xl font-black tracking-tight">{data.healthScore}</p>
                <p className="text-xs text-slate-500 mt-2">
                  0–100 composite integrity score derived from system checks.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                  Risk Level
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    data.riskLevel === 'high'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/40'
                      : data.riskLevel === 'medium'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {data.riskLevel}
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Deterministic classification from the governance engine.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Audit Hash</p>
                <p className="font-mono text-xs break-all text-slate-300">{data.hash}</p>
                <p className="text-[11px] text-slate-500 mt-2">
                  SHA-256 of the full audit report. Any public mirror can verify integrity by
                  recomputing this hash.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
                  Generated At
                </p>
                <p className="text-sm font-medium text-slate-100">
                  {data.generatedAt
                    ? new Date(data.generatedAt).toLocaleString()
                    : 'No data'}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Pending AI</p>
                <p className="text-sm font-medium text-slate-100">{data.stats.pendingAI}</p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
                  Vote Anomalies
                </p>
                <p className="text-sm font-medium text-slate-100">{data.stats.voteAnomalies}</p>
              </div>
            </section>
          </>
        )}

        <footer className="pt-2 border-t border-slate-900/60 mt-4">
          <p className="text-[11px] text-slate-500">
            This page is read-only. It carries no user data, no secrets, and no identifiers — only
            a signed snapshot of how healthy the political infrastructure is.
          </p>
        </footer>
      </div>
    </div>
  );
}
