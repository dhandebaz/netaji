
import React from 'react';
import { Network, GitCommit, FileJson, ArrowRight, Database, Globe, Monitor, ShieldCheck } from 'lucide-react';
import { SystemSettings } from '../../../types';

interface Props {
    settings: SystemSettings;
}

const SettingsLogic: React.FC<Props> = ({ settings }) => {
    return (
        <div className="space-y-8 max-w-5xl">
            <div className="mb-6 pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Network className="text-indigo-600" /> System Logic & Architecture
                </h2>
                <p className="text-slate-500">
                    Internal operational graph for AI Agents and MCP Context. Defines causal relationships between settings and application behavior.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* SECTION 1: CONFIGURATION TOPOLOGY */}
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <GitCommit size={16} /> Configuration Topology
                    </h3>
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-1 overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-500 font-bold uppercase">
                                <tr>
                                    <th className="p-3">Setting Key</th>
                                    <th className="p-3">Affected Module</th>
                                    <th className="p-3">Current State</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-mono">
                                <LogicRow 
                                    setting="features.enableNyayFauj" 
                                    module="Route: /volunteer" 
                                    value={settings.features.enableNyayFauj} 
                                    desc="Enables RTI Dashboard & Leaderboard"
                                />
                                <LogicRow 
                                    setting="features.enableLiveVoice" 
                                    module="Comp: AIChatWidget" 
                                    value={settings.features.enableLiveVoice} 
                                    desc="Activates Gemini Realtime API WebSocket"
                                />
                                <LogicRow 
                                    setting="features.enableComparison" 
                                    module="Page: Compare.tsx" 
                                    value={settings.features.enableComparison} 
                                    desc="Enables multi-candidate analysis logic"
                                />
                                <LogicRow 
                                    setting="ai.defaultProviderId" 
                                    module="Service: geminiService" 
                                    value={settings.ai.defaultProviderId} 
                                    desc="Determines LLM Gateway Endpoint"
                                />
                                <LogicRow 
                                    setting="security.apiRateLimit" 
                                    module="Middleware: RateLimiter" 
                                    value={settings.security.apiRateLimit} 
                                    desc="Max requests/min per IP"
                                />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION 2: DATA FLOW PIPELINE */}
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Database size={16} /> Data Ingestion Flow
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-[50px] -z-0"></div>
                        
                        <FlowStep 
                            step="1" 
                            icon={<Globe size={16}/>} 
                            title="Source Extraction" 
                            desc="scraperService.ts fetches HTML from ECI/MyNeta via Proxy Rotation." 
                        />
                        <div className="pl-6"><ArrowRight className="text-slate-300 rotate-90" size={20} /></div>
                        
                        <FlowStep 
                            step="2" 
                            icon={<ShieldCheck size={16}/>} 
                            title="Normalization & Verification" 
                            desc="Data is cleaned, types are cast to Politician interface. Missing images fallback to placeholders." 
                        />
                        <div className="pl-6"><ArrowRight className="text-slate-300 rotate-90" size={20} /></div>

                        <FlowStep 
                            step="3" 
                            icon={<Database size={16}/>} 
                            title="Vector Embedding (RAG)" 
                            desc="Text bio is embedded via Gemini-001 and stored in Pinecone for semantic search." 
                        />
                        <div className="pl-6"><ArrowRight className="text-slate-300 rotate-90" size={20} /></div>

                        <FlowStep 
                            step="4" 
                            icon={<Monitor size={16}/>} 
                            title="Client Hydration" 
                            desc="React Context hydrates state. LocalStorage caches user session and preferences." 
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 3: LIVE CONTEXT DUMP */}
            <div className="pt-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
                    <FileJson size={16} /> Active System Context (JSON)
                </h3>
                <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden relative group">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-slate-400 uppercase">Read-Only</span>
                    </div>
                    <pre className="font-mono text-xs text-green-400 overflow-x-auto custom-scrollbar-dark h-[300px]">
                        {JSON.stringify(settings, null, 2)}
                    </pre>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                    * This JSON object represents the single source of truth for the application's behavior. 
                    AI Agents should read this to determine current capabilities.
                </p>
            </div>
        </div>
    );
};

const LogicRow = ({ setting, module, value, desc }: any) => (
    <tr className="hover:bg-slate-50 transition-colors">
        <td className="p-3 font-bold text-slate-700">{setting}</td>
        <td className="p-3 text-slate-500">{module}</td>
        <td className="p-3">
            <div className="flex flex-col">
                <span className={`font-bold ${typeof value === 'boolean' ? (value ? 'text-green-600' : 'text-red-500') : 'text-blue-600'}`}>
                    {String(value)}
                </span>
                <span className="text-[10px] text-slate-400">{desc}</span>
            </div>
        </td>
    </tr>
);

const FlowStep = ({ step, icon, title, desc }: any) => (
    <div className="flex items-start gap-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-200 shrink-0">
            {step}
        </div>
        <div className="flex-grow">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                {icon} {title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default SettingsLogic;
