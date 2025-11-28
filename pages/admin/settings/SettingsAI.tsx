
import React, { useState } from 'react';
import { 
    BrainCircuit, Plus, Trash2, Zap, AlertOctagon, ChevronDown, 
    ChevronUp, CheckCircle, XCircle, RefreshCw, Sparkles, Settings, 
    Activity, Server, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemSettings, AIProviderConfig } from '../../../types';

interface Props {
    settings: SystemSettings;
    updateSettings: (newSettings: SystemSettings) => void;
}

const PRESETS = [
    { name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com', models: ['gemini-2.5-flash', 'gemini-3-pro-preview'] },
    { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229'] },
    { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', models: ['meta-llama/llama-3-70b-instruct', 'mistralai/mixtral-8x22b'] },
    { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama3-70b-8192', 'mixtral-8x7b-32768'] },
    { name: 'Local (Ollama)', baseUrl: 'http://localhost:11434/v1', models: ['llama3', 'mistral'] },
];

const PERSONAS = [
    { label: "Political Analyst (Default)", text: "You are NetaAI, a neutral political analyst for India. Provide objective facts, cite sources from affidavits, and avoid taking sides." },
    { label: "Legal Expert", text: "You are a legal aide assisting with RTI drafting. Focus on the RTI Act 2005 sections, formal language, and procedural accuracy." },
    { label: "Journalist Mode", text: "You are an investigative journalist. Highlight discrepancies in assets and criminal records. Use sharp, concise language." },
    { label: "Simple English", text: "Explain complex political concepts in very simple English suitable for a 10-year-old." }
];

const SettingsAI: React.FC<Props> = ({ settings, updateSettings }) => {
    const [openProviderId, setOpenProviderId] = useState<string | null>(null);
    const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
    const [testStatus, setTestStatus] = useState<Record<string, 'success' | 'error' | null>>({});

    const updateAI = (key: keyof SystemSettings['ai'], value: any) => {
        updateSettings({
            ...settings,
            ai: { ...settings.ai, [key]: value }
        });
    };

    const addProvider = (presetName: string) => {
        const preset = PRESETS.find(p => p.name === presetName) || { name: 'Custom Provider', baseUrl: '', models: [] };
        const newProvider: AIProviderConfig = {
            id: `prov-${Date.now()}`,
            name: preset.name,
            baseUrl: preset.baseUrl,
            apiKey: '',
            enabled: true,
            priority: settings.ai.providers.length + 1,
            models: preset.models
        };
        updateAI('providers', [...settings.ai.providers, newProvider]);
        setOpenProviderId(newProvider.id);
    };

    const updateProvider = (id: string, field: keyof AIProviderConfig, value: any) => {
        const newProviders = settings.ai.providers.map(p => 
            p.id === id ? { ...p, [field]: value } : p
        );
        updateAI('providers', newProviders);
    };

    const removeProvider = (id: string) => {
        const newProviders = settings.ai.providers.filter(p => p.id !== id);
        updateAI('providers', newProviders);
    };

    const testConnection = async (id: string) => {
        setTestingProviderId(id);
        setTestStatus(prev => ({ ...prev, [id]: null }));
        
        // Simulate API latency
        await new Promise(r => setTimeout(r, 1500));
        
        // Basic mock validation logic
        const provider = settings.ai.providers.find(p => p.id === id);
        const success = provider && provider.baseUrl.length > 5 && (provider.name.includes('Local') || provider.apiKey.length > 5);
        
        setTestStatus(prev => ({ ...prev, [id]: success ? 'success' : 'error' }));
        setTestingProviderId(null);
    };

    return (
        <div className="space-y-8 max-w-6xl pb-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BrainCircuit className="text-purple-600" size={24} /> Generative Intelligence
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Orchestrate LLM gateways, fine-tune inference parameters, and manage system personas.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                    <Activity size={16} className="text-purple-600" />
                    <span className="text-xs font-bold text-purple-900">
                        Tokens Used: <span className="font-mono">2.4M</span>
                    </span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* LEFT: Provider Management */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Controls */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-slate-900 text-lg">Model Gateways</h3>
                            <div className="flex items-center gap-2 text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
                                <Zap size={12} className={settings.ai.failoverEnabled ? "text-amber-500 fill-amber-500" : "text-slate-400"} />
                                Failover: {settings.ai.failoverEnabled ? 'On' : 'Off'}
                            </div>
                        </div>
                        <div className="relative group">
                            <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                                <Plus size={14} /> Add Provider
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block z-20 animate-in fade-in zoom-in-95 duration-200">
                                {PRESETS.map(preset => (
                                    <button 
                                        key={preset.name}
                                        onClick={() => addProvider(preset.name)}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 border-b border-slate-50 last:border-0"
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => addProvider('Custom')}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                >
                                    Custom...
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Provider List */}
                    <div className="space-y-4">
                        {settings.ai.providers.map((provider) => (
                            <motion.div 
                                layout
                                key={provider.id} 
                                className={`bg-white rounded-2xl border transition-all ${
                                    openProviderId === provider.id ? 'border-purple-200 ring-4 ring-purple-50/50' : 'border-slate-200 shadow-sm hover:shadow-md'
                                }`}
                            >
                                {/* Collapsed Header */}
                                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setOpenProviderId(openProviderId === provider.id ? null : provider.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                                            provider.name.includes('Gemini') ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                            provider.name.includes('OpenAI') ? 'bg-slate-900' :
                                            provider.name.includes('Anthropic') ? 'bg-orange-600' :
                                            'bg-purple-600'
                                        }`}>
                                            {provider.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{provider.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">Priority {provider.priority}</span>
                                                {provider.id === settings.ai.defaultProviderId && (
                                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
                                                        <CheckCircle size={10} /> Default
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Toggle 
                                            checked={provider.enabled} 
                                            onChange={(v) => {
                                                updateProvider(provider.id, 'enabled', v);
                                                // Prevent click propagation to accordion
                                            }} 
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className={`text-slate-300 transition-transform duration-300 ${openProviderId === provider.id ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {openProviderId === provider.id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label">Endpoint URL</label>
                                                        <input 
                                                            type="text" 
                                                            value={provider.baseUrl}
                                                            onChange={(e) => updateProvider(provider.id, 'baseUrl', e.target.value)}
                                                            className="input-field font-mono text-xs"
                                                            placeholder="https://api.example.com/v1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="label">API Key</label>
                                                        <div className="relative">
                                                            <input 
                                                                type="password" 
                                                                value={provider.apiKey}
                                                                onChange={(e) => updateProvider(provider.id, 'apiKey', e.target.value)}
                                                                className="input-field font-mono text-xs pr-8"
                                                                placeholder="sk-..."
                                                            />
                                                            {testStatus[provider.id] === 'success' && <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                                                            {testStatus[provider.id] === 'error' && <XCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="label">Supported Models</label>
                                                    <input 
                                                        type="text" 
                                                        value={provider.models.join(', ')}
                                                        onChange={(e) => updateProvider(provider.id, 'models', e.target.value.split(',').map(s => s.trim()))}
                                                        className="input-field"
                                                        placeholder="gpt-4, gemini-pro"
                                                    />
                                                    <p className="text-[10px] text-slate-400 mt-1">Separate model IDs with commas.</p>
                                                </div>

                                                <div className="flex justify-between items-center pt-2">
                                                    <button 
                                                        onClick={() => removeProvider(provider.id)}
                                                        className="text-red-500 text-xs font-bold flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={14} /> Remove
                                                    </button>
                                                    <div className="flex gap-3">
                                                        {provider.id !== settings.ai.defaultProviderId && (
                                                            <button 
                                                                onClick={() => updateAI('defaultProviderId', provider.id)}
                                                                className="text-slate-500 text-xs font-bold hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                Make Default
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => testConnection(provider.id)}
                                                            disabled={testingProviderId === provider.id}
                                                            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
                                                        >
                                                            {testingProviderId === provider.id ? <RefreshCw size={14} className="animate-spin"/> : <Server size={14}/>}
                                                            {testingProviderId === provider.id ? 'Verifying...' : 'Test Connection'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Hyperparameters & Persona */}
                <div className="space-y-6">
                    
                    {/* Hyperparameters Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Settings size={18} className="text-slate-400" /> Model Config
                        </h3>
                        
                        <div className="space-y-5">
                            {/* Temperature */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Temperature</label>
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{settings.ai.temperature}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.1"
                                    value={settings.ai.temperature}
                                    onChange={(e) => updateAI('temperature', parseFloat(e.target.value))}
                                    className="w-full accent-purple-600 cursor-pointer"
                                />
                                <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-bold uppercase">
                                    <span>Precise</span>
                                    <span>Creative</span>
                                </div>
                            </div>

                            {/* Top P */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Top P</label>
                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{settings.ai.topP}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.05"
                                    value={settings.ai.topP}
                                    onChange={(e) => updateAI('topP', parseFloat(e.target.value))}
                                    className="w-full accent-slate-600 cursor-pointer"
                                />
                            </div>

                            {/* Max Tokens */}
                            <div>
                                <label className="label">Max Output Tokens</label>
                                <input 
                                    type="number"
                                    value={settings.ai.maxTokens}
                                    onChange={(e) => updateAI('maxTokens', parseInt(e.target.value))}
                                    className="input-field"
                                />
                            </div>

                            {/* Safety */}
                            <div>
                                <label className="label">Safety Filter</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['low', 'medium', 'high'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => updateAI('safetyFilterLevel', level)}
                                            className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                                settings.ai.safetyFilterLevel === level 
                                                ? 'bg-slate-900 text-white shadow-md' 
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Persona Architect */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-[400px]">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Code size={18} className="text-slate-400" /> System Persona
                        </h3>
                        
                        {/* Presets */}
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3 mb-2">
                            {PERSONAS.map((p) => (
                                <button
                                    key={p.label}
                                    onClick={() => updateAI('systemPrompt', p.text)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-grow relative bg-[#1e1e1e] rounded-xl overflow-hidden shadow-inner">
                            <div className="absolute top-0 left-0 right-0 h-6 bg-[#252526] flex items-center px-3 gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                <span className="ml-2 text-[10px] text-slate-500 font-mono">system_prompt.txt</span>
                            </div>
                            <textarea 
                                value={settings.ai.systemPrompt}
                                onChange={(e) => updateAI('systemPrompt', e.target.value)}
                                className="w-full h-full bg-transparent text-slate-300 font-mono text-xs p-4 pt-8 outline-none resize-none"
                                spellCheck={false}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const Toggle = ({ checked, onChange, onClick }: { checked: boolean, onChange: (v: boolean) => void, onClick?: (e: any) => void }) => (
    <button 
        onClick={(e) => { if(onClick) onClick(e); onChange(!checked); }}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-purple-600' : 'bg-slate-200'}`}
    >
        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
);

export default SettingsAI;
