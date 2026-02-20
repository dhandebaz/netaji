
import React, { useState, useEffect } from 'react';
import { 
    Save, Check, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { getSystemSettings } from '../../services/adminService';
import { SystemSettings } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getAdminSettings, saveAdminSettings } from '../../services/apiService';

// Import Modular Settings Pages
import SettingsGeneral from './settings/SettingsGeneral';
import SettingsAI from './settings/SettingsAI';
import SettingsDatabase from './settings/SettingsDatabase';
import SettingsFeatures from './settings/SettingsFeatures';
import SettingsSecurity from './settings/SettingsSecurity';
import SettingsBilling from './settings/SettingsBilling';
import SettingsLogic from './settings/SettingsLogic';

interface Props {
    activePage?: string;
}

const AdminSettings: React.FC<Props> = ({ activePage = 'general' }) => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const { addToast } = useToast();
    const { token } = useAuth();

    useEffect(() => {
        const loadSettings = async () => {
            try {
                if (!token) {
                    setSettings(getSystemSettings());
                    return;
                }
                const remote = await getAdminSettings(token);
                setSettings(remote as SystemSettings);
            } catch {
                setSettings(getSystemSettings());
            }
        };
        loadSettings();
    }, [token]);

    const handleSave = async () => {
        if (!settings) return;
        setSaveStatus('saving');
        try {
            if (!token) {
                setSaveStatus('saved');
                addToast('Configuration saved locally (no auth token).', 'success');
                setTimeout(() => setSaveStatus('idle'), 2000);
                return;
            }
            const result = await saveAdminSettings(settings, token);
            const nextSettings = (result as any).settings || settings;
            setSettings(nextSettings);
            setSaveStatus('saved');
            addToast('System configuration saved successfully.', 'success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
            setSaveStatus('idle');
            addToast('Failed to save configuration. Please try again.', 'error');
        }
    };

    if (!settings) return <div className="p-10 text-center text-slate-400">Loading Configuration...</div>;

    return (
        <div className="w-full max-w-7xl mx-auto relative pb-32">
            
            {/* Header (Title Only) */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900">System Configuration</h1>
                    {settings.general.maintenanceMode && (
                         <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
                             <AlertTriangle size={12} /> MAINTENANCE ACTIVE
                         </div>
                    )}
                </div>
                <p className="text-slate-500">Global control center for Neta Platform v{settings.general.systemVersion}</p>
            </div>

            {/* Main Content (Native Flow) */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activePage === 'general' && <SettingsGeneral settings={settings} updateSettings={setSettings} />}
                        {activePage === 'ai' && <SettingsAI settings={settings} updateSettings={setSettings} />}
                        {activePage === 'data' && <SettingsDatabase settings={settings} updateSettings={setSettings} />}
                        {activePage === 'features' && <SettingsFeatures settings={settings} updateSettings={setSettings} />}
                        {activePage === 'security' && <SettingsSecurity settings={settings} updateSettings={setSettings} />}
                        {activePage === 'billing' && <SettingsBilling settings={settings} updateSettings={setSettings} />}
                        {activePage === 'logic' && <SettingsLogic settings={settings} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Action Bar */}
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed bottom-6 right-8 z-40 flex items-center gap-4"
            >
                <button 
                    onClick={handleSave}
                    disabled={saveStatus !== 'idle'}
                    className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all shadow-2xl ${
                        saveStatus === 'saved' ? 'bg-green-600 hover:bg-green-700' : 
                        saveStatus === 'saving' ? 'bg-slate-700 cursor-wait' :
                        'bg-slate-900 hover:bg-slate-800 hover:scale-105'
                    }`}
                >
                    {saveStatus === 'saved' ? <Check size={20}/> : saveStatus === 'saving' ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
                    {saveStatus === 'saved' ? 'Configuration Saved' : saveStatus === 'saving' ? 'Saving Changes...' : 'Save Changes'}
                </button>
            </motion.div>
        </div>
    );
};

export default AdminSettings;
