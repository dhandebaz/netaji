
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    Menu, X, ShieldCheck, LayoutDashboard, LogIn, Home as HomeIcon, 
    ChevronRight, UserPlus, Database, Terminal, LogOut, Map as MapIcon, 
    BarChart3, TrendingUp, Megaphone, Languages, Globe, ChevronDown, Check,
    AlertCircle, Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { INDIAN_LANGUAGES } from '../constants';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu on route change
  useEffect(() => {
      setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide Navbar completely on SuperAdmin pages to prevent UI overlap
  if (location.pathname.startsWith('/superadmin')) {
    return null;
  }

  // Improved active state logic (handles sub-routes)
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const selectedLanguage = INDIAN_LANGUAGES.find(l => l.code === currentLang);

  return (
    <>
      {/* --- DESKTOP: COMPACT PILL NAVBAR --- */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className={`hidden lg:flex fixed top-6 inset-x-0 mx-auto w-fit max-w-[95vw] z-[60] items-center p-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.2,0.0,0,1.0)] gap-2 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-xl shadow-slate-900/5 h-12' 
            : 'bg-white/80 backdrop-blur-lg border border-white/40 shadow-lg shadow-slate-900/5 h-14'
        }`}
      >
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 px-3 group shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
            N
          </div>
          <span className="font-bold text-base text-slate-800 tracking-tight">Neta</span>
        </Link>

        {/* Navigation Pills */}
        <div className="flex items-center px-1 shrink-0 h-full gap-1">
          <DesktopLink to="/" label="Home" active={isActive('/') && location.pathname === '/'} />
          <DesktopLink to="/complaints" label="Complaints" active={isActive('/complaints')} />
          <DesktopLink to="/election-analytics" label="Exit Polls" active={isActive('/election-analytics')} isLive />
          <DesktopLink to="/games" label="Games" active={isActive('/games')} />
          
          {user && (user.role === 'volunteer' || user.role === 'superadmin') && (
             <DesktopLink to="/volunteer" label="Nyay Fauj" active={isActive('/volunteer')} />
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        {/* Language & Actions */}
        <div className="flex items-center gap-2 pr-1 shrink-0">
           
           {/* Language Dropdown */}
           <div className="relative">
               <button 
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
               >
                   <Globe size={14} />
                   {selectedLanguage?.code.toUpperCase()}
                   <ChevronDown size={12} />
               </button>
               
               <AnimatePresence>
                   {langOpen && (
                       <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full mt-2 right-0 w-48 max-h-64 overflow-y-auto custom-scrollbar bg-white rounded-2xl shadow-xl border border-slate-200 p-1 z-50"
                       >
                           {INDIAN_LANGUAGES.map(lang => (
                               <button
                                  key={lang.code}
                                  onClick={() => { setCurrentLang(lang.code); setLangOpen(false); }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                                      currentLang === lang.code ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                                  }`}
                               >
                                   <span>{lang.name} <span className="opacity-50 font-normal">({lang.nativeName})</span></span>
                                   {currentLang === lang.code && <Check size={12}/>}
                               </button>
                           ))}
                       </motion.div>
                   )}
               </AnimatePresence>
           </div>

           {!user ? (
             <>
               <Link to="/login" className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">Login</Link>
               <Link to="/login?tab=signup" className="px-4 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-all flex items-center gap-2">
                 <UserPlus size={14} /> Join
               </Link>
             </>
           ) : (
             <div className="flex items-center gap-2">
                <Link to={user.role === 'representative' ? '/politician-dashboard' : '/volunteer'} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200">
                  {user.name[0]}
                </Link>
             </div>
           )}
        </div>
      </motion.nav>

      {/* --- MOBILE: NATIVE BOTTOM BAR + SHEET --- */}
      {/* Only visible on screens smaller than lg */}
      <div className="lg:hidden">
          
          {/* Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-3 pb-safe z-[60] flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              <MobileNavItem to="/" icon={<HomeIcon size={22}/>} label="Home" active={isActive('/') && location.pathname === '/'} />
              <MobileNavItem to="/complaints" icon={<AlertCircle size={22}/>} label="Complaints" active={isActive('/complaints')} />
              
              {/* Center Floating Action Button (Menu Trigger) */}
              <div className="relative -top-6">
                  <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg shadow-slate-900/30 active:scale-95 transition-transform"
                  >
                      <Menu size={24} />
                  </button>
              </div>

              <MobileNavItem to="/election-analytics" icon={<TrendingUp size={22}/>} label="Polls" active={isActive('/election-analytics')} isLive />
              <MobileNavItem to="/games" icon={<Gamepad2 size={22}/>} label="Games" active={isActive('/games')} />
          </div>

          {/* Bottom Sheet (Drawer) */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
                />
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[80] max-h-[85vh] overflow-hidden flex flex-col pb-safe"
                >
                    {/* Drag Handle */}
                    <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsMenuOpen(false)}>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        {/* User Profile Section */}
                        {user ? (
                            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{user.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{user.role} Account</p>
                                    </div>
                                </div>
                                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="bg-blue-600 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-blue-500/30">
                                <h3 className="font-bold text-xl mb-1">Join the Movement</h3>
                                <p className="text-blue-100 text-sm mb-4">Access verified data and vote anonymously.</p>
                                <div className="flex gap-3">
                                    <Link to="/login" className="flex-1 py-2.5 bg-white/20 rounded-xl font-bold text-sm text-center hover:bg-white/30 transition-colors">Login</Link>
                                    <Link to="/login?tab=signup" className="flex-1 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm text-center hover:bg-blue-50 transition-colors shadow-sm">Sign Up</Link>
                                </div>
                            </div>
                        )}

                        {/* Grid Menu */}
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Applications</h4>
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <SheetItem to="/rankings" icon={<BarChart3 className="text-green-500"/>} label="Leaderboard" onClick={() => setIsMenuOpen(false)} />
                            <SheetItem to="/maps" icon={<MapIcon className="text-orange-500"/>} label="Maps" onClick={() => setIsMenuOpen(false)} />
                            <SheetItem to="/open-data" icon={<Database className="text-purple-500"/>} label="Open Data" onClick={() => setIsMenuOpen(false)} />
                            <SheetItem to="/developer" icon={<Terminal className="text-slate-600"/>} label="Dev API" onClick={() => setIsMenuOpen(false)} />
                            {user?.role === 'representative' && (
                                <SheetItem to="/politician-dashboard" icon={<Megaphone className="text-green-600"/>} label="Dashboard" onClick={() => setIsMenuOpen(false)} />
                            )}
                            {user?.role === 'superadmin' && (
                                <SheetItem to="/superadmin" icon={<LayoutDashboard className="text-red-600"/>} label="Super Admin" onClick={() => setIsMenuOpen(false)} />
                            )}
                        </div>

                        {/* Language Selector */}
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Language</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {INDIAN_LANGUAGES.slice(0, 6).map(lang => (
                                <button 
                                    key={lang.code}
                                    onClick={() => { setCurrentLang(lang.code); setIsMenuOpen(false); }}
                                    className={`px-4 py-3 rounded-xl text-sm font-bold text-left border transition-all ${
                                        currentLang === lang.code 
                                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                        : 'bg-white border-slate-100 text-slate-600'
                                    }`}
                                >
                                    {lang.nativeName}
                                </button>
                            ))}
                            <button className="px-4 py-3 rounded-xl text-sm font-bold text-center border border-dashed border-slate-300 text-slate-400">
                                +16 More
                            </button>
                        </div>
                    </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
      </div>
    </>
  );
};

const DesktopLink = ({ to, label, active, isLive }: { to: string, label: string, active: boolean, isLive?: boolean }) => (
  <Link 
    to={to} 
    className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
      active 
        ? 'bg-slate-100 text-slate-900 shadow-inner' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
    }`}
  >
    {isLive && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
        </span>
    )}
    {label}
  </Link>
);

const MobileNavItem = ({ to, icon, label, active, isLive }: any) => (
    <Link to={to} className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
        <div className="relative">
            {React.cloneElement(icon, { 
                fill: active ? 'currentColor' : 'none', 
                strokeWidth: active ? 0 : 2 
            })}
            {isLive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
        </div>
        <span className="text-[10px] font-bold">{label}</span>
    </Link>
);

const SheetItem = ({ to, icon, label, onClick }: any) => (
    <Link to={to} onClick={onClick} className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-2xl active:scale-95 transition-transform">
        <div className="mb-2">{icon}</div>
        <span className="text-xs font-bold text-slate-700">{label}</span>
    </Link>
);

export default Navbar;
