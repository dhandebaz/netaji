import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, BrainCircuit, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSystemAudit } from '../../services/apiService';

type IssueSeverity = 'low' | 'medium' | 'high';

type Issue = {
  code: string;
  severity: IssueSeverity;
  message: string;
};

type AuditStats = {
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

type AuditReport = {
  healthScore: number;
  riskLevel: IssueSeverity;
  issues: Issue[];
  stats: AuditStats;
  generatedAt: string;
};

const severityColor: Record<IssueSeverity, string> = {
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

const riskColor: Record<IssueSeverity, string> = {
  low: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  medium: 'text-amber-600 bg-amber-50 border-amber-100',
  high: 'text-red-600 bg-red-50 border-red-100',
};

const SystemIntelligence: React.FC = () => {
  const { token } = useAuth();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getSystemAudit(token);
        setReport(data as AuditReport);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load system audit');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const healthPercent = report ? Math.max(0, Math.min(100, report.healthScore)) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <BrainCircuit className="text-purple-600" size={28} />
            System Intelligence
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Deterministic governance engine. Read-only analysis of DB, cron, vector index, and AI health.
          </p>
        </div>
        {report && (
          <div className={`px-4 py-2 rounded-2xl text-xs font-bold border ${riskColor[report.riskLevel]}`}>
            <span className="uppercase tracking-wider mr-2">Risk Level</span>
            <span>{report.riskLevel.toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Health Score
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Composite of cron reliability, AI backlog, vote anomalies, and infra status.
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">
                {report ? report.healthScore : '--'}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
          </div>
          <div className="mt-3 h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          {loading && (
            <div className="mt-4 flex items-center text-xs text-slate-500 gap-2">
              <Loader2 size={14} className="animate-spin" />
              Running system audit...
            </div>
          )}
          {error && (
            <div className="mt-4 flex items-center text-xs text-red-600 gap-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Signals
              </span>
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Generated</span>
              <span className="font-mono">
                {report?.generatedAt
                  ? new Date(report.generatedAt).toLocaleString()
                  : '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>AI backlog</span>
              <span className="font-mono">
                {report ? report.stats.pendingAI : '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Stale profiles</span>
              <span className="font-mono">
                {report ? report.stats.staleProfiles : '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Vote anomalies</span>
              <span className="font-mono">
                {report ? report.stats.voteAnomalies : '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Governance stability</span>
              <span className="font-mono">
                {report?.stats.governanceStability ?? '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Projected stability</span>
              <span className="font-mono">
                {report?.stats.projectedStability ?? '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Health drift</span>
              <span className="font-mono">
                {typeof report?.stats.healthDrift === 'number'
                  ? report.stats.healthDrift
                  : '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
            Issues
          </h2>
          {report && report.issues.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle size={16} className="text-emerald-500" />
              No active issues detected in the latest scan.
            </div>
          )}
          <div className="space-y-3">
            {report?.issues.map((issue) => (
              <div
                key={issue.code}
                className={`border rounded-xl px-3 py-2.5 text-sm flex items-start gap-3 ${severityColor[issue.severity]}`}
              >
                <div className="mt-0.5">
                  {issue.severity === 'high' && (
                    <AlertTriangle size={16} className="text-red-600" />
                  )}
                  {issue.severity === 'medium' && (
                    <AlertTriangle size={16} className="text-amber-600" />
                  )}
                  {issue.severity === 'low' && (
                    <Activity size={16} className="text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {issue.code}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60">
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemIntelligence;
