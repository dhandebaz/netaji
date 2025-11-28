
import React from 'react';
import { Server, Shield, Lock, Globe } from 'lucide-react';
import { SystemSettings } from '../../../types';

interface Props {
    settings: SystemSettings;
    updateSettings: (newSettings: SystemSettings) => void;
}

const SettingsSecurity: React.FC<Props> = ({ settings, updateSettings }) => {
    const update = (key: keyof SystemSettings['security'], value: any) => {
        updateSettings({
            ...settings,
            security: { ...settings.security, [key]: value }
        });
    };

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 max-w-4xl">
            <div className="mb-8 pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="text-green-600" /> Security & Access
                </h2>
                <p className="text-slate-500 mt-1">Configure rate limiting, session policies, and firewalls.</p>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                        <label className="label">API Rate Limit (Req/Min)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={settings.security.apiRateLimit}
                                onChange={(e) => update('apiRateLimit', parseInt(e.target.value))}
                                className="input-field pl-10" 
                            />
                            <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>
                    <div className="w-full">
                        <label className="label">Session Timeout (Minutes)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={settings.security.sessionTimeout}
                                onChange={(e) => update('sessionTimeout', parseInt(e.target.value))}
                                className="input-field pl-10" 
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                     <div className="flex items-center justify-between">
                         <div>
                             <h4 className="font-bold text-slate-900">Require Email Verification</h4>
                             <p className="text-xs text-slate-500">Users must verify email before accessing sensitive features.</p>
                         </div>
                         <Toggle 
                            checked={settings.security.requireEmailVerification} 
                            onChange={(v) => update('requireEmailVerification', v)} 
                         />
                     </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Globe size={16} className="text-blue-600"/> Admin IP Whitelist
                    </h4>
                    <p className="text-xs text-slate-500 mb-2">Only allow admin access from these IPs (one per line).</p>
                    <textarea 
                        className="input-field min-h-[150px] font-mono text-xs leading-relaxed bg-slate-50 focus:bg-white"
                        placeholder="192.168.1.1&#10;10.0.0.5"
                        value={settings.security.adminIpWhitelist.join('\n')}
                        onChange={(e) => update('adminIpWhitelist', e.target.value.split('\n'))}
                    />
                </div>
            </div>
        </div>
    );
};

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <button 
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </button>
);

export default SettingsSecurity;
