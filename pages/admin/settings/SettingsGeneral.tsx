
import React from 'react';
import { AlertTriangle, Globe, LayoutTemplate, Languages, Key } from 'lucide-react';
import { SystemSettings } from '../../../types';

interface Props {
    settings: SystemSettings;
    updateSettings: (newSettings: SystemSettings) => void;
}

const SettingsGeneral: React.FC<Props> = ({ settings, updateSettings }) => {
    const update = (key: keyof SystemSettings['general'], value: any) => {
        updateSettings({
            ...settings,
            general: { ...settings.general, [key]: value }
        });
    };

    const updateTranslation = (field: string, value: any) => {
        updateSettings({
            ...settings,
            general: {
                ...settings.general,
                translation: {
                    ...settings.general.translation,
                    [field]: value
                }
            }
        });
    };

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 max-w-4xl">
            <div className="mb-8 pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="text-blue-500" /> General Configuration
                </h2>
                <p className="text-slate-500 mt-1">Basic site identity, localization, and operational status.</p>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                        <label className="label">Platform Name</label>
                        <input 
                            type="text" 
                            value={settings.general.siteName}
                            onChange={(e) => update('siteName', e.target.value)}
                            className="input-field" 
                        />
                    </div>
                    <div className="w-full">
                        <label className="label">Support Email</label>
                        <input 
                            type="email" 
                            value={settings.general.supportEmail}
                            onChange={(e) => update('supportEmail', e.target.value)}
                            className="input-field" 
                        />
                    </div>
                </div>

                <div className="w-full md:w-1/2">
                    <label className="label">Timezone</label>
                    <select
                        value={settings.general.timezone}
                        onChange={(e) => update('timezone', e.target.value)}
                        className="input-field"
                    >
                        <option value="Asia/Kolkata">India (IST) - Asia/Kolkata</option>
                        <option value="UTC">Universal (UTC)</option>
                        <option value="America/New_York">US Eastern (EST)</option>
                    </select>
                </div>

                {/* Translation Settings */}
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-6">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-lg mb-2">
                        <Languages size={20} /> Localization & Translation
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-indigo-700 uppercase mb-1.5">Translation Provider</label>
                            <select 
                                value={settings.general.translation.provider}
                                onChange={(e) => updateTranslation('provider', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="google">Google Cloud Translation</option>
                                <option value="azure">Azure AI Translator</option>
                                <option value="deepl">DeepL API</option>
                                <option value="none">None (English Only)</option>
                            </select>
                        </div>
                        
                        {settings.general.translation.provider !== 'none' && (
                            <div>
                                <label className="block text-xs font-bold text-indigo-700 uppercase mb-1.5">API Key</label>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        value={settings.general.translation.apiKey}
                                        onChange={(e) => updateTranslation('apiKey', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        placeholder="Paste API Key here..."
                                    />
                                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                         <div className="text-indigo-800 text-sm font-medium">
                             Auto-detect user language based on browser settings
                         </div>
                         <Toggle 
                            checked={settings.general.translation.autoDetect} 
                            onChange={(v) => updateTranslation('autoDetect', v)} 
                         />
                    </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                     <div className="flex items-center justify-between">
                         <div>
                             <h4 className="font-bold text-slate-900">Public Signups</h4>
                             <p className="text-xs text-slate-500">Allow new users to create accounts.</p>
                         </div>
                         <Toggle 
                            checked={settings.general.allowSignups} 
                            onChange={(v) => update('allowSignups', v)} 
                         />
                     </div>
                     <div className="w-full h-px bg-slate-200"></div>
                     <div className="flex items-center justify-between">
                         <div>
                             <h4 className="font-bold text-red-600 flex items-center gap-2">
                                 <AlertTriangle size={16} /> Maintenance Mode
                             </h4>
                             <p className="text-xs text-slate-500">Disable access for all non-admin users.</p>
                         </div>
                         <Toggle 
                            checked={settings.general.maintenanceMode} 
                            onChange={(v) => update('maintenanceMode', v)} 
                            danger
                         />
                     </div>
                </div>
            </div>
        </div>
    );
};

const Toggle = ({ checked, onChange, danger }: { checked: boolean, onChange: (v: boolean) => void, danger?: boolean }) => (
    <button 
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            checked 
            ? (danger ? 'bg-red-500' : 'bg-blue-600') 
            : 'bg-slate-200'
        }`}
    >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </button>
);

export default SettingsGeneral;
