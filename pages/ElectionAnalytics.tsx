
import React, { useEffect, useState } from 'react';
import { Activity, Timer, ShieldCheck, BarChart3, Database } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import LiveTicker from '../components/election/LiveTicker';
import KeyBattles from '../components/election/KeyBattles';
import PredictionMap from '../components/election/PredictionMap';
import BlockchainLedger from '../components/election/BlockchainLedger';
import { calculateElectionPredictions } from '../services/predictionService';
import { ElectionPrediction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const ElectionAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState<ElectionPrediction[]>([]);

  useEffect(() => {
      // Initial load
      setPredictions(calculateElectionPredictions());
      
      // Mock live updates
      const interval = setInterval(() => {
          setPredictions(calculateElectionPredictions());
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition>
        <div className="min-h-screen bg-slate-50 font-sans pt-20 pb-12">
        
        {/* --- LIVE HEADER --- */}
        <div className="bg-slate-900 text-white py-4 px-4 md:px-8 shadow-lg relative overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                <h1 className="text-xl font-black tracking-wider uppercase">
                    Neta Prediction Model <span className="text-blue-400">2025</span>
                </h1>
                </div>
                
                <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
                    <div className="flex items-center gap-2">
                        <Database size={16} /> 
                        <span>Data Points: <span className="text-emerald-400 font-mono">14,203</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity size={16} /> 
                        <span>Confidence: <span className="text-emerald-400">High (89%)</span></span>
                    </div>
                </div>
            </div>
            {/* Background texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <LiveTicker />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
            
            {/* TOP SECTION: PREDICTION ENGINE */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Projection Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm h-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Projected Seat Share</h3>
                            <p className="text-xs text-slate-500">Based on Net Approval Score (Votes - Complaints)</p>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase">Live Model</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={predictions}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="projectedSeats"
                                    >
                                        {predictions.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {predictions.map((p) => (
                                <div key={p.party} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                                        <span className="text-sm font-bold text-slate-700">{p.party}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${p.winProbability}%`, backgroundColor: p.color }}></div>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-slate-900 w-8 text-right">{p.projectedSeats}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Prediction Map */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex-grow">
                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <BarChart3 className="text-blue-600" size={20} /> Electoral Map
                        </h3>
                        <PredictionMap predictions={predictions} />
                    </div>
                </div>
            </div>

            {/* MIDDLE: BATTLES & BLOCKCHAIN */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <KeyBattles />
                </div>
                <div className="lg:col-span-2">
                    <BlockchainLedger />
                </div>
            </div>

            {/* Methodology */}
            <div className="bg-slate-900 text-white p-8 rounded-[32px] text-center max-w-4xl mx-auto mt-12">
                <ShieldCheck className="mx-auto text-emerald-400 mb-4" size={32} />
                <h2 className="text-xl font-bold mb-2">Methodology & Fairness</h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
                    Our predictions differ from traditional media exit polls. We use <strong>Real-time Voter Sentiment</strong> derived from:
                    <br/>
                    1. Verified Citizen Votes (SHA-256 Hashed)
                    <br/>
                    2. Unresolved Complaint Penalties
                    <br/>
                    3. Constituency-level Engagement Rates
                    <br/><br/>
                    This data is internal to the Neta Platform and represents the "Digital Mandate".
                </p>
            </div>
        </div>
        </div>
    </PageTransition>
  );
};

export default ElectionAnalytics;
