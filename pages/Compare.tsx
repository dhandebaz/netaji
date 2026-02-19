
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchPoliticiansByIds } from '../services/dataService';
import { CheckCircle, AlertTriangle, ArrowLeft, Sparkles, BrainCircuit, Loader, BarChart3, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateComparisonAnalysis, ComparisonAnalysis, isAIAvailable } from '../services/geminiService';
import { Politician } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';
import AddPoliticianSearch from '../components/compare/AddPoliticianSearch';

const Compare: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ids = useMemo(() => searchParams.get('ids')?.split(',').map(Number) || [], [searchParams]);
  
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loadingPoliticians, setLoadingPoliticians] = useState(true);

  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoadingPoliticians(true);
      if (ids.length > 0) {
        const data = await fetchPoliticiansByIds(ids);
        setPoliticians(data);
      } else {
        setPoliticians([]);
      }
      setLoadingPoliticians(false);
    };
    loadData();
  }, [ids]);

  if (loadingPoliticians) {
    return (
        <div className="min-h-screen flex items-center justify-center text-slate-500 gap-2">
            <Loader2 className="animate-spin" /> Loading Comparison...
        </div>
    );
  }

  if (politicians.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <BarChart3 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Profiles Selected</h2>
            <p className="text-slate-500 mb-6">Select politicians from the home page to start comparing.</p>
            <Link to="/" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                Go to Home
            </Link>
        </div>
      </div>
    );
  }

  const handleAnalyze = async () => {
    // Check if AI is available (client-side or server-side)
    // For now we try anyway, service will handle fallback
    setLoadingAnalysis(true);
    setError(null);
    try {
        const result = await generateComparisonAnalysis(politicians);
        setAnalysis(result);
    } catch (e: any) {
        console.error(e);
        setError(e.message || 'Failed to generate analysis');
    } finally {
        setLoadingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div className="flex items-center gap-3">
               <Link to="/" className="p-2 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft size={20}/></Link>
               <div>
                   <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Comparison Matrix</h1>
                   <p className="text-slate-500 font-medium text-sm">Analyzing {politicians.length} candidates</p>
               </div>
           </div>
           
           {!analysis && !loadingAnalysis && (
               <button 
                 onClick={handleAnalyze}
                 className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 transition-all flex items-center gap-2"
               >
                 <Sparkles size={18} className="animate-pulse" /> Generate Comparison
               </button>
           )}
        </div>

        {/* AI Insight Dashboard */}
        <AnimatePresence>
            {(loadingAnalysis || analysis) && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 overflow-hidden"
                >
                    <div className="bg-white rounded-[32px] shadow-xl border border-blue-100 p-6 md:p-8 relative overflow-hidden">
                        {/* Background Gradient */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                {loadingAnalysis ? <Loader className="animate-spin" /> : <BrainCircuit />}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {loadingAnalysis ? 'Generating Analysis...' : 'Executive Analysis Report'}
                            </h2>
                        </div>

                        {loadingAnalysis ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                            </div>
                        ) : error ? (
                             <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 text-red-700">
                                <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h3 className="font-bold text-sm">Analysis Failed</h3>
                                    <p className="text-sm mt-1">{error}</p>
                                    <button onClick={handleAnalyze} className="text-xs font-bold underline mt-2 hover:text-red-800">Try Again</button>
                                </div>
                             </div>
                        ) : analysis && (
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Summary</h3>
                                        <p className="text-slate-700 leading-relaxed text-lg font-medium">{analysis.executiveSummary}</p>
                                    </div>
                                    
                                    {analysis.keyDifferentiators.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Differentiators</h3>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {analysis.keyDifferentiators.map((diff, i) => (
                                                <div key={i} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                                    <span className="text-sm text-slate-700">{diff}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    )}

                                    {analysis.verdict && (
                                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                        <h3 className="text-blue-800 font-bold flex items-center gap-2 mb-1">
                                            <CheckCircle size={16} /> Verdict
                                        </h3>
                                        <p className="text-blue-700 text-sm">{analysis.verdict}</p>
                                    </div>
                                    )}
                                </div>

                                {analysis.transparencyScores.length > 0 && (
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Transparency Scores</h3>
                                    <div className="space-y-5">
                                        {analysis.transparencyScores.map(score => {
                                            const politician = politicians.find(p => p.id === score.politicianId);
                                            if (!politician) return null;
                                            
                                            return (
                                                <div key={score.politicianId}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-slate-700 text-sm">{politician.name}</span>
                                                        <span className={`font-black text-sm ${score.score > 75 ? 'text-green-600' : score.score > 50 ? 'text-orange-500' : 'text-red-500'}`}>{score.score}/100</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${score.score}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className={`h-full rounded-full ${score.score > 75 ? 'bg-green-500' : score.score > 50 ? 'bg-orange-500' : 'bg-red-500'}`} 
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 leading-tight">{score.reason}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Comparison Table */}
        <div className="overflow-hidden bg-white rounded-[32px] shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-fixed">
                <thead>
                <tr className="border-b border-slate-100">
                    <th className="w-48 p-6 bg-slate-50/50 text-left text-slate-400 font-bold text-xs uppercase tracking-wider">Attribute</th>
                    {politicians.map(p => (
                    <th key={p.id} className="p-6 text-center w-64 group/col relative">
                        <button 
                            onClick={() => handleRemovePolitician(p.id)}
                            className="absolute top-2 right-2 p-1 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover/col:opacity-100 transition-all"
                            title="Remove from comparison"
                        >
                            <X size={14} />
                        </button>
                        <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <ImageWithFallback src={p.photoUrl} alt={p.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-lg border border-slate-50">
                                {p.partyLogo}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 text-lg flex items-center justify-center gap-1">
                            {p.name} {p.verified && <CheckCircle size={16} className="text-blue-500 fill-blue-50" />}
                            </div>
                            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md mt-1 inline-block">{p.party}</div>
                        </div>
                        </div>
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                <Row label="State / Constituency">
                    {politicians.map(p => (
                        <td key={p.id} className="p-6 text-center">
                            <p className="font-bold text-slate-800 text-base">{p.state}</p>
                            <p className="text-slate-500 text-xs font-medium mt-1">{p.constituency}</p>
                        </td>
                    ))}
                </Row>
                <Row label="Age & Education">
                    {politicians.map(p => (
                        <td key={p.id} className="p-6 text-center">
                            <p className="font-bold text-slate-800">{p.age} Years</p>
                            <p className="text-slate-500 text-xs mt-1">{p.education}</p>
                        </td>
                    ))}
                </Row>
                <Row label="Declared Assets">
                    {politicians.map(p => (
                        <td key={p.id} className="p-6 text-center">
                            <p className="font-black text-2xl text-slate-800 tracking-tight">₹{p.totalAssets}<span className="text-base text-slate-400 font-medium ml-1">Cr</span></p>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-green-500 h-full rounded-full" style={{width: `${Math.min((p.totalAssets/50)*100, 100)}%`}}></div>
                            </div>
                        </td>
                    ))}
                </Row>
                <Row label="Criminal Record">
                    {politicians.map(p => (
                    <td key={p.id} className="p-6 text-center">
                        {p.criminalCases > 0 ? (
                        <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 font-bold border border-red-100">
                                <AlertTriangle size={16} /> {p.criminalCases} Cases
                            </span>
                            <span className="text-[10px] text-red-400 font-medium mt-1">Serious charges pending</span>
                        </div>
                        ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 text-green-700 font-bold border border-green-100">
                             <CheckCircle size={16} /> Clean Record
                        </span>
                        )}
                    </td>
                    ))}
                </Row>
                <Row label="Parliament Attendance">
                    {politicians.map(p => (
                        <td key={p.id} className="p-6 text-center">
                        <div className="relative w-16 h-16 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-blue-600" strokeDasharray={`${p.attendance}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">{p.attendance}%</div>
                        </div>
                        </td>
                    ))}
                </Row>
                <Row label="Public Approval">
                    {politicians.map(p => {
                    const total = p.votes.up + p.votes.down;
                    const percent = Math.round((p.votes.up / total) * 100);
                    return (
                        <td key={p.id} className="p-6 text-center">
                        <div className="flex items-center justify-center gap-1 mb-2">
                            <span className={`text-3xl font-black tracking-tight ${percent > 50 ? 'text-green-600' : 'text-red-500'}`}>{percent}%</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{total.toLocaleString()} Verified Votes</p>
                        </td>
                    );
                    })}
                </Row>
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, children }: { label: string, children?: React.ReactNode }) => (
  <tr className="group hover:bg-slate-50/50 transition-colors">
    <td className="p-6 font-bold text-slate-500 border-r border-slate-50 group-hover:border-slate-100">{label}</td>
    {children}
  </tr>
);

export default Compare;
