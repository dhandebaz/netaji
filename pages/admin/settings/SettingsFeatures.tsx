
import React, { useState } from 'react';
import { 
    Shield, Terminal, Mic, Users, Globe, 
    AlertTriangle, Zap, Activity, BarChart3,
    Lock, Beaker, Radio, CheckCircle
} from 'lucide-react';
import { SystemSettings } from '../../../types';
import { motion } from 'framer-motion';

interface Props {
    settings: SystemSettings;
    updateSettings: (newSettings: SystemSettings) => void;
}

const SettingsFeatures: React.FC<Props> = ({ settings, updateSettings }) => {
    const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

    const update = (key: keyof SystemSettings['features'], value: boolean) => {
        updateSettings({
            ...settings,
            features: { ...settings.features, [key]: value }
        });
    };

    const handleEmergencyStop = () => {
        updateSettings({
            ...settings,
            features: {
                ...settings.features,
                enableLiveVoice: false,
                enableNyayFauj: false,
                enableDeveloperAPI: false,
                enableBetaFeatures: false
            }
        });
        setShowEmergencyConfirm(false);
    };

    return (
        <div className="space-y-8 max-w-5xl pb-12">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Zap className="text-yellow-500 fill-yellow-500" size={24} /> Feature Management
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Control system modules, release channels, and emergency overrides.
                    </p>
                </div>
                
                {/* Emergency Controls */}
                <div className="relative">
                    {!showEmergencyConfirm ? (
                        <button 
                            onClick={() => setShowEmergencyConfirm(true)}
                            className="bg-red-50 text-red-600 border border-red-100 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 hover:border-red-200 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <AlertTriangle size={16} /> Emergency Kill Switch
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200 bg-red-50 p-1 pr-2 rounded-xl border border-red-100">
                            <span className="text-xs font-bold text-red-600 ml-3 mr-2">Shutdown critical systems?</span>
                            <button 
                                onClick={handleEmergencyStop}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 shadow-lg shadow-red-500/30"
                            >
                                CONFIRM
                            </button>
                            <button 
                                onClick={() => setShowEmergencyConfirm(false)}
                                className="bg-white text-slate-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 border border-slate-200"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* SECTION 1: CORE MODULES */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <Shield size={14} /> Platform Modules
                    </h3>
                    
                    <FeatureCard 
                        icon={<Users size={20} className="text-orange-600"/>}
                        title="Nyay Fauj"
                        desc="RTI Ops, Volunteer CRM, and Leaderboards."
                        checked={settings.features.enableNyayFauj}
                        onChange={(v) => update('enableNyayFauj', v)}
                        status="stable"
                    />
                    
                    <FeatureCard 
                        icon={<Globe size={20} className="text-blue-600"/>}
                        title="Open Data Portal"
                        desc="Public access to datasets and API docs."
                        checked={settings.features.enableOpenData}
                        onChange={(v) => update('enableOpenData', v)}
                        status="stable"
                    />

                    <FeatureCard 
                        icon={<Terminal size={20} className="text-purple-600"/>}
                        title="Developer API"
                        desc="External access tokens and rate limiting."
                        checked={settings.features.enableDeveloperAPI}
                        onChange={(v) => update('enableDeveloperAPI', v)}
                        status="beta"
                        risk="medium"
                    />
                </div>

                {/* SECTION 2: INTELLIGENCE & AI */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <Activity size={14} /> Intelligence Layer
                    </h3>

                    <FeatureCard 
                        icon={<Mic size={20} className="text-red-500"/>}
                        title="Live Voice Mode"
                        desc="Real-time audio conversations via Gemini API."
                        checked={settings.features.enableLiveVoice}
                        onChange={(v) => update('enableLiveVoice', v)}
                        status="alpha"
                        risk="high"
                    />

                    <FeatureCard 
                        icon={<Radio size={20} className="text-indigo-500"/>}
                        title="Comparison Engine"
                        desc="Side-by-side politician analysis logic."
                        checked={settings.features.enableComparison}
                        onChange={(v) => update('enableComparison', v)}
                        status="stable"
                    />

                    <FeatureCard 
                        icon={<BarChart3 size={20} className="text-emerald-600"/>}
                        title="Advanced Analytics"
                        desc="Predictive modeling for admin dashboard."
                        checked={settings.features.enableAdvancedAnalytics}
                        onChange={(v) => update('enableAdvancedAnalytics', v)}
                        status="beta"
                    />
                </div>

                {/* SECTION 3: SYSTEM & ACCESS (Full Width) */}
                <div className="lg:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <Lock size={14} /> System Access & Global Overrides
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                        <MiniFeatureCard 
                            label="Guest Browsing"
                            checked={settings.features.enableGuestBrowsing}
                            onChange={(v) => update('enableGuestBrowsing', v)}
                            icon={<Globe size={16} className="text-slate-400"/>}
                        />
                        <MiniFeatureCard 
                            label="Maintenance Alert"
                            checked={settings.features.enableMaintenanceAlert}
                            onChange={(v) => update('enableMaintenanceAlert', v)}
                            alert
                            icon={<AlertTriangle size={16} className="text-orange-500"/>}
                        />
                        <MiniFeatureCard 
                            label="Beta Features"
                            checked={settings.features.enableBetaFeatures}
                            onChange={(v) => update('enableBetaFeatures', v)}
                            icon={<Beaker size={16} className="text-purple-500"/>}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, checked, onChange, status, risk }: any) => {
    const statusColors: Record<string, string> = {
        stable: 'bg-green-100 text-green-700 border-green-200',
        beta: 'bg-blue-100 text-blue-700 border-blue-200',
        alpha: 'bg-purple-100 text-purple-700 border-purple-200'
    };

    return (
        <div className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${checked ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-75'}`}>
            <div className="flex gap-4">
                <div className={`p-3 rounded-xl h-fit transition-colors ${checked ? 'bg-slate-50' : 'bg-white border border-slate-100'}`}>
                    {icon}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">{title}</h4>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${statusColors[status]}`}>
                            {status}
                        </span>
                        {risk === 'high' && (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                                <AlertTriangle size={8} /> High Cost
                            </span>
                        )}
                        {risk === 'medium' && (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                                Med Risk
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{desc}</p>
                </div>
            </div>
            
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
};

const MiniFeatureCard = ({ label, checked, onChange, alert, icon }: any) => (
    <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${checked ? (alert ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200 shadow-sm') : 'bg-slate-50 border-slate-200 opacity-70'}`}>
        <div className="flex items-center gap-3">
            {icon}
            <span className={`text-sm font-bold ${alert ? 'text-orange-800' : 'text-slate-700'}`}>{label}</span>
        </div>
        <Toggle checked={checked} onChange={onChange} danger={alert} />
    </div>
);

const Toggle = ({ checked, onChange, danger }: { checked: boolean, onChange: (v: boolean) => void, danger?: boolean }) => (
    <button 
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
            checked 
            ? (danger ? 'bg-orange-500' : 'bg-slate-900') 
            : 'bg-slate-200'
        }`}
    >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
);

export default SettingsFeatures;
