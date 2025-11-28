
import React from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { SystemSettings } from '../../../types';

interface Props {
    settings: SystemSettings;
    updateSettings: (newSettings: SystemSettings) => void;
}

const SettingsBilling: React.FC<Props> = ({ settings, updateSettings }) => {
    const updateBilling = (key: string, value: any) => {
        updateSettings({
            ...settings,
            billing: { ...settings.billing, [key]: value }
        });
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="mb-6 pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900">Billing & Monetization</h2>
                <p className="text-slate-500">Configure developer pricing plans and payment gateways.</p>
            </div>
            
            {/* Pricing */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <CreditCard className="text-green-600" size={20} /> Developer Subscription Plans
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="label">Currency Symbol</label>
                        <input 
                            type="text" 
                            value={settings.billing.currency}
                            onChange={(e) => updateBilling('currency', e.target.value)}
                            className="input-field text-center font-bold text-lg" 
                        />
                    </div>
                    <div>
                        <label className="label">Monthly Price</label>
                        <input 
                            type="number" 
                            value={settings.billing.monthly}
                            onChange={(e) => updateBilling('monthly', parseInt(e.target.value))}
                            className="input-field" 
                        />
                    </div>
                    <div>
                        <label className="label">Yearly Price</label>
                        <input 
                            type="number" 
                            value={settings.billing.yearly}
                            onChange={(e) => updateBilling('yearly', parseInt(e.target.value))}
                            className="input-field" 
                        />
                    </div>
                </div>
            </div>

            {/* Gateways */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-900">Payment Gateways</h3>
                {settings.gateways.map((gw, idx) => (
                    <div key={gw.provider} className={`bg-white p-5 rounded-2xl border transition-all ${gw.enabled ? 'border-blue-300 shadow-sm' : 'border-slate-200 opacity-70'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${gw.enabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                <span className="font-bold text-slate-900 capitalize text-lg">{gw.provider}</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-500">{gw.mode}</span>
                            </div>
                            <Toggle 
                                checked={gw.enabled}
                                onChange={(v) => {
                                    const newGateways = [...settings.gateways];
                                    newGateways[idx].enabled = v;
                                    updateSettings({...settings, gateways: newGateways});
                                }}
                            />
                        </div>
                        
                        {gw.enabled && (
                            <div className="grid grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-2">
                                <div>
                                    <label className="label">API Key / Client ID</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={gw.apiKey}
                                            onChange={(e) => {
                                                const newGateways = [...settings.gateways];
                                                newGateways[idx].apiKey = e.target.value;
                                                updateSettings({...settings, gateways: newGateways});
                                            }}
                                            className="input-field pl-8 font-mono text-xs"
                                        />
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Secret Key</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={gw.apiSecret}
                                            onChange={(e) => {
                                                const newGateways = [...settings.gateways];
                                                newGateways[idx].apiSecret = e.target.value;
                                                updateSettings({...settings, gateways: newGateways});
                                            }}
                                            className="input-field pl-8 font-mono text-xs"
                                        />
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
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

export default SettingsBilling;
