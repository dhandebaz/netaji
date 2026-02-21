import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSystemSnapshots } from '../../services/apiService';

type Snapshot = {
  id: number;
  hash: string;
  healthScore: number;
  riskLevel: string;
  createdAt: string;
};

const SystemSnapshots: React.FC = () => {
  const { token } = useAuth();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSnapshots = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getSystemSnapshots(token);
        setSnapshots(data.data ?? data);
      } catch (err: any) {
        setError(err.message || 'Failed to load system snapshots');
      } finally {
        setLoading(false);
      }
    };

    loadSnapshots();
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">System Snapshots</h1>
          <p className="text-sm text-slate-500">
            Daily signed snapshots of system health for audit and verification.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Last {snapshots.length} snapshots
          </span>
          {loading && <span className="text-xs text-slate-400">Refreshing…</span>}
        </div>

        {error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : snapshots.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">No snapshots recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Hash</th>
                  <th className="px-6 py-3 text-left">Health</th>
                  <th className="px-6 py-3 text-left">Risk</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-6 py-3 text-slate-700">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-600">
                      {s.hash.slice(0, 16)}…
                    </td>
                    <td className="px-6 py-3 text-slate-800 font-semibold">{s.healthScore}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          s.riskLevel === 'high'
                            ? 'bg-red-100 text-red-700'
                            : s.riskLevel === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {s.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSnapshots;

