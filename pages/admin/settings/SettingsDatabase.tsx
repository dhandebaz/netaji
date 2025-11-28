
import React, { useState } from 'react';
import { 
    Database, Plus, Trash2, RefreshCw, CheckCircle, XCircle, 
    Server, HardDrive, Archive, Lock, Download, Upload, ShieldCheck, Clock 
} from 'lucide-react';
import { SystemSettings, DatabaseConfig } from '../../../types';

interface Props {
    settings: SystemSettings;
    updateSettings: (newSettings: SystemSettings) => void;
}

const SettingsDatabase: React.FC<Props> = ({ settings, updateSettings }) => {
    const [isBackingUp, setIsBackingUp] = useState(false);

    const updateDBs = (newDBs: DatabaseConfig[]) => {
        updateSettings({
            ...settings,
            data: { ...settings.data, databases: newDBs }
        });
    };

    const updateData = (key: keyof SystemSettings['data'], value: any) => {
        updateSettings({
            ...settings,
            data: { ...settings.data, [key]: value }
        });
    };

    const addDB = () => {
        const newDB: DatabaseConfig = {
            type: 'postgres',
            name: 'New Database',
            connectionString: '',
            enabled: false,
            status: 'disconnected'
        };
        updateDBs([...settings.data.databases, newDB]);
    };

    const updateDB = (index: number, field: keyof DatabaseConfig, value: any) => {
        const updated = [...settings.data.databases];
        updated[index] = { ...updated[index], [field]: value };
        updateDBs(updated);
    };

    const removeDB = (index: number) => {
        const updated = settings.data.databases.filter((_, i) => i !== index);
        updateDBs(updated);
    };

    const handleTestConnection = (index: number) => {
        // Simulate connection test
        updateDB(index, 'status', 'disconnected');
        setTimeout(() => {
            const success = Math.random() > 0.3;
            updateDB(index, 'status', success ? 'connected' : 'error');
        }, 1500);
    };

    const handleBackup = () => {
        setIsBackingUp(true);
        setTimeout(() => {
            setIsBackingUp(false);
            updateData('lastBackup', new Date().toISOString());
        }, 2000);
    };

    return (
        <div className="space-y-8 max-w-6xl pb-10">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Database className="text-blue-600" size={24} /> Data Infrastructure
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Manage storage clusters, vector indices, and data governance policies.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                        <Upload size={16} /> Import
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Top Grid: Analytics & Governance */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* 1. Storage Analytics */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <HardDrive size={18} className="text-slate-400" /> Storage Utilization
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                                <span>Total Capacity (5GB)</span>
                                <span>2.1 GB Used</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                                <div className="h-full bg-blue-500 w-[35%]" title="Relational Data"></div>
                                <div className="h-full bg-purple-500 w-[15%]" title="Vector Index"></div>
                                <div className="h-full bg-slate-300 w-[5%]" title="Logs"></div>
                            </div>
                            <div className="flex gap-4 mt-3">
                                <LegendItem color="bg-blue-500" label="Postgres" />
                                <LegendItem color="bg-purple-500" label="Vectors" />
                                <LegendItem color="bg-slate-300" label="Logs" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Vector Count</p>
                                <p className="text-xl font-black text-slate-900">842,000</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Cache Hits</p>
                                <p className="text-xl font-black text-slate-900">94.2%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Governance Controls */}
                <div className="space-y-6">
                    {/* Encryption */}
                    <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Lock size={16} className="text-emerald-600" /> Encryption
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-1">At-rest & In-transit</p>
                            </div>
                            <Toggle checked={settings.data.encryptionEnabled} onChange={(v) => updateData('encryptionEnabled', v)} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                            <ShieldCheck size={14} />
                            AES-256 Active
                        </div>
                    </div>

                    {/* Retention */}
                    <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <Archive size={16} className="text-orange-500" /> Retention
                            </h4>
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {settings.data.retentionDays} Days
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="30" 
                            max="365" 
                            step="15" 
                            value={settings.data.retentionDays}
                            onChange={(e) => updateData('retentionDays', parseInt(e.target.value))}
                            className="w-full accent-slate-900 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400 mt-2 text-center">Logs older than {settings.data.retentionDays} days are purged.</p>
                    </div>
                </div>
            </div>

            {/* Middle: Backup Strategy */}
            <div className="bg-slate-900 text-white p-6 rounded-[24px] flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-slate-900/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <Clock size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Snapshot Policy</h3>
                        <p className="text-slate-400 text-xs flex items-center gap-2">
                            Last successful backup: <span className="text-white font-mono">{new Date(settings.data.lastBackup || '').toLocaleString()}</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Frequency</label>
                        <select 
                            value={settings.data.backupFrequency}
                            onChange={(e) => updateData('backupFrequency', e.target.value)}
                            className="bg-slate-800 text-white text-sm font-bold rounded-lg px-3 py-2 outline-none border border-slate-700 focus:border-blue-500"
                        >
                            <option value="off">Manual Only</option>
                            <option value="daily">Daily (00:00 UTC)</option>
                            <option value="weekly">Weekly (Sun)</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleBackup}
                        disabled={isBackingUp}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isBackingUp ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
                        {isBackingUp ? 'Backing Up...' : 'Backup Now'}
                    </button>
                </div>
            </div>

            {/* Bottom: Connection Manager */}
            <div className="space-y-4">
                <div className="flex justify-between items-center pt-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                        <Server size={20} className="text-slate-400"/> Active Connections
                    </h3>
                    <button onClick={addDB} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                        <Plus size={14}/> Add New Source
                    </button>
                </div>

                {settings.data.databases.map((db, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${db.enabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <Database size={24} />
                                </div>
                                <div>
                                    <input 
                                        type="text" 
                                        value={db.name}
                                        onChange={(e) => updateDB(idx, 'name', e.target.value)}
                                        className="font-bold text-slate-900 text-base bg-transparent outline-none hover:underline w-full"
                                    />
                                    <div className="flex items-center gap-2 mt-1">
                                        <select 
                                            value={db.type}
                                            onChange={(e) => updateDB(idx, 'type', e.target.value)}
                                            className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase"
                                        >
                                            <option value="postgres">PostgreSQL</option>
                                            <option value="supabase">Supabase</option>
                                            <option value="pinecone">Pinecone</option>
                                            <option value="redis">Redis</option>
                                        </select>
                                        <StatusBadge status={db.status} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Toggle checked={db.enabled} onChange={(v) => updateDB(idx, 'enabled', v)} />
                                <button onClick={() => removeDB(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                            </div>
                        </div>

                        {db.enabled && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-1">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Connection String</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={db.connectionString}
                                                onChange={(e) => updateDB(idx, 'connectionString', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none focus:border-blue-400"
                                                placeholder="postgres://user:pass@host:5432/db"
                                            />
                                            <Lock size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">API Key (Optional)</label>
                                        <input 
                                            type="password" 
                                            value={db.apiKey || ''}
                                            onChange={(e) => updateDB(idx, 'apiKey', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none focus:border-blue-400"
                                            placeholder="sk-..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button 
                                        onClick={() => handleTestConnection(idx)}
                                        className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 transition-colors"
                                    >
                                        <RefreshCw size={12} /> Test Connection
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-xs font-bold text-slate-500">{label}</span>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'connected') return <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded"><CheckCircle size={10}/> Connected</span>;
    if (status === 'error') return <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded"><XCircle size={10}/> Error</span>;
    return <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Disconnected</span>;
};

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <button 
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
);

export default SettingsDatabase;
