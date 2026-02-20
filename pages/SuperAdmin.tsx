
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, LayoutDashboard, FileText, Users, Inbox, BrainCircuit, 
  Database, Settings, Menu, LogOut, Bell, Search, ChevronDown, ChevronRight,
  Globe, Sliders, Shield, CreditCard, Network, CheckCircle, Info, AlertCircle, Mic2, Gamepad2, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/adminService';
import { AdminNotification } from '../types';

// Import Modular Admin Components
import AdminDashboard from './admin/AdminDashboard';
import AdminRTI from './admin/AdminRTI';
import AdminVolunteers from './admin/AdminVolunteers';
import AdminPoliticians from './admin/AdminPoliticians';
import AdminGrievances from './admin/AdminGrievances';
import AdminComplaints from './admin/AdminComplaints';
import AdminAICore from './admin/AdminAICore';
import AdminDataPipeline from './admin/AdminDataPipeline';
import AdminSettings from './admin/AdminSettings';
import AdminGames from './admin/AdminGames';
import AdminAIChatbot from './admin/AdminAIChatbot';

const SuperAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Notifications
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      setNotifications(getNotifications());
      
      const handleClickOutside = (event: MouseEvent) => {
          if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
              setIsNotificationsOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  const handleTabChange = (tab: string) => {
    if (tab.startsWith('settings-')) {
        setIsSettingsOpen(true);
    }
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const toggleSettingsMenu = () => {
      setIsSettingsOpen(!isSettingsOpen);
  };

  const markAsRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
      setNotifications([]);
  };

  if (!user || user.role !== 'superadmin') {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-sans">
              <div className="text-center">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={48} className="text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">Access Restricted</h2>
                  <p className="max-w-md mx-auto">This terminal is classified Level 5. Your credentials do not match the required security clearance for the Neta Operating System.</p>
                  <button onClick={logout} className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                      Return to Public Sector
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans text-slate-800 overflow-hidden selection:bg-blue-500/30">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30">
          <div className="flex items-center gap-3">
             <button onClick={toggleSidebar} className="p-2 text-slate-600"><Menu size={24}/></button>
             <span className="font-bold text-lg tracking-tight">Neta OS</span>
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              {user.name[0]}
          </div>
      </div>

      {/* Sidebar Backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={toggleSidebar}
                className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static top-0 left-0 h-full w-72 bg-slate-900 text-slate-400 z-50 
        transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/50">
                N
            </div>
            <div>
                <h1 className="font-bold text-white text-lg tracking-tight">Neta OS</h1>
                <p className="text-xs text-slate-500 font-mono">v3.4.0-Stable</p>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar py-6 space-y-1">
            <div className="px-6 mb-2 text-xs font-bold uppercase text-slate-600 tracking-wider">Operations</div>
            
            <SidebarLink icon={<LayoutDashboard size={20} />} label="Command Center" active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} />
            <SidebarLink icon={<FileText size={20} />} label="RTI Operations" active={activeTab === 'rti'} onClick={() => handleTabChange('rti')} />
            <SidebarLink icon={<Users size={20} />} label="Nyay Fauj CRM" active={activeTab === 'volunteers'} onClick={() => handleTabChange('volunteers')} />
            <SidebarLink icon={<ShieldCheck size={20} />} label="Politician Registry" active={activeTab === 'politicians'} onClick={() => handleTabChange('politicians')} />
            <SidebarLink icon={<Inbox size={20} />} label="Help Desk" active={activeTab === 'grievances'} onClick={() => handleTabChange('grievances')} />
            <SidebarLink icon={<MessageSquare size={20} />} label="Civic Moderation" active={activeTab === 'complaints'} onClick={() => handleTabChange('complaints')} />
            <SidebarLink icon={<Gamepad2 size={20} />} label="Games Arcade" active={activeTab === 'games'} onClick={() => handleTabChange('games')} />

            <div className="px-6 mt-8 mb-2 text-xs font-bold uppercase text-slate-600 tracking-wider">System</div>
            
            <SidebarLink icon={<MessageSquare size={20} />} label="AI Assistant" active={activeTab === 'ai-chatbot'} onClick={() => handleTabChange('ai-chatbot')} />
            <SidebarLink icon={<BrainCircuit size={20} />} label="Neural Core" active={activeTab === 'ai-core'} onClick={() => handleTabChange('ai-core')} />
            <SidebarLink icon={<Database size={20} />} label="Data Pipeline" active={activeTab === 'pipeline'} onClick={() => handleTabChange('pipeline')} />
            
            {/* Settings Group */}
            <div className="relative">
                <button 
                    onClick={toggleSettingsMenu}
                    className={`w-full px-6 py-3 flex items-center justify-between transition-colors ${isSettingsOpen || activeTab.startsWith('settings') ? 'text-white' : 'hover:text-slate-200'}`}
                >
                    <div className="flex items-center gap-3 font-medium">
                        <Settings size={20} />
                        <span>Configuration</span>
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                    {isSettingsOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-950/50"
                        >
                            <SettingsLink label="General" active={activeTab === 'settings-general'} onClick={() => handleTabChange('settings-general')} icon={<Globe size={14}/>} />
                            <SettingsLink label="AI & Models" active={activeTab === 'settings-ai'} onClick={() => handleTabChange('settings-ai')} icon={<BrainCircuit size={14}/>} />
                            <SettingsLink label="Data & Storage" active={activeTab === 'settings-data'} onClick={() => handleTabChange('settings-data')} icon={<Database size={14}/>} />
                            <SettingsLink label="SEO & Previews" active={activeTab === 'settings-seo'} onClick={() => handleTabChange('settings-seo')} icon={<Globe size={14}/>} />
                            <SettingsLink label="Feature Flags" active={activeTab === 'settings-features'} onClick={() => handleTabChange('settings-features')} icon={<Sliders size={14}/>} />
                            <SettingsLink label="Security" active={activeTab === 'settings-security'} onClick={() => handleTabChange('settings-security')} icon={<Shield size={14}/>} />
                            <SettingsLink label="Billing" active={activeTab === 'settings-billing'} onClick={() => handleTabChange('settings-billing')} icon={<CreditCard size={14}/>} />
                            <SettingsLink label="System Logic" active={activeTab === 'settings-logic'} onClick={() => handleTabChange('settings-logic')} icon={<Network size={14}/>} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        <div className="p-6 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">
                    {user.name[0]}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
            </div>
            <button onClick={logout} className="w-full py-2 rounded-lg bg-slate-800 hover:bg-red-900/20 hover:text-red-500 text-slate-400 text-xs font-bold transition-all flex items-center justify-center gap-2">
                <LogOut size={14} /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow h-screen overflow-hidden flex flex-col pt-16 md:pt-0">
          
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
              <div className="flex items-center gap-4 text-slate-400">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Search system logs, users, or tasks..." 
                    className="bg-transparent outline-none text-sm font-medium w-64 md:w-96 text-slate-600 placeholder-slate-300"
                  />
              </div>
              <div className="flex items-center gap-4 relative">
                  <div className="relative" ref={notificationRef}>
                      <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative"
                      >
                          <Bell size={20} />
                          {unreadCount > 0 && (
                              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                          )}
                      </button>

                      <AnimatePresence>
                          {isNotificationsOpen && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                              >
                                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                      <h4 className="font-bold text-xs uppercase text-slate-500">Notifications</h4>
                                      <button onClick={clearNotifications} className="text-[10px] font-bold text-blue-600 hover:underline">Clear All</button>
                                  </div>
                                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                      {notifications.length === 0 ? (
                                          <div className="p-8 text-center text-slate-400 text-xs font-medium">No new alerts.</div>
                                      ) : (
                                          notifications.map(n => (
                                              <div 
                                                key={n.id} 
                                                onClick={() => markAsRead(n.id)}
                                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-blue-50/30' : ''}`}
                                              >
                                                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                                  <div>
                                                      <p className={`text-xs ${!n.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{n.message}</p>
                                                      <p className="text-[10px] text-slate-400 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                                  </div>
                                              </div>
                                          ))
                                      )}
                                  </div>
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <div className="flex items-center gap-2">
                      <div className="text-right hidden md:block">
                          <p className="text-xs font-bold text-slate-700">Super Admin</p>
                          <p className="text-[10px] text-slate-400 font-medium">Level 5 Access</p>
                      </div>
                  </div>
              </div>
          </header>

          {/* Viewport */}
          <div className="flex-grow overflow-x-hidden overflow-y-auto bg-[#f8fafc] p-4 md:p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                      {activeTab === 'dashboard' && <AdminDashboard />}
                      {activeTab === 'rti' && <AdminRTI />}
                      {activeTab === 'volunteers' && <AdminVolunteers />}
                      {activeTab === 'politicians' && <AdminPoliticians />}
                      {activeTab === 'grievances' && <AdminGrievances />}
                      {activeTab === 'complaints' && <AdminComplaints />}
                      {activeTab === 'games' && <AdminGames />}
                      
                      {activeTab === 'ai-chatbot' && <AdminAIChatbot />}
                      {activeTab === 'ai-core' && <AdminAICore />}
                      {activeTab === 'pipeline' && <AdminDataPipeline />}
                      
                      {activeTab.startsWith('settings') && (
                          <AdminSettings activePage={activeTab.replace('settings-', '')} />
                      )}
                  </motion.div>
              </AnimatePresence>
          </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`w-full px-6 py-3 flex items-center gap-3 transition-all border-l-2 ${
            active 
            ? 'border-blue-500 bg-white/5 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' 
            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
    >
        <div className={active ? 'text-blue-400' : ''}>{icon}</div>
        <span className={`text-sm font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
);

const SettingsLink = ({ icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`w-full pl-14 pr-6 py-2.5 flex items-center gap-3 transition-colors text-xs ${
            active 
            ? 'text-blue-400 font-bold bg-white/5' 
            : 'text-slate-500 hover:text-slate-300'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default SuperAdmin;
