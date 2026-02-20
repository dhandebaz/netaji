
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { initializeData, syncPoliticiansWithBackend } from './services/dataService';
import { AdminDataFetcher } from './components/AdminDataFetcher';
import { ErrorBoundary } from './components/ErrorBoundary';
import { startAutoRefresh } from './services/dataRefreshScheduler';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const PoliticianProfile = lazy(() => import('./pages/PoliticianProfile'));
const PoliticianRankings = lazy(() => import('./pages/PoliticianRankings'));
const NyayFauj = lazy(() => import('./pages/NyayFauj'));
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const DeveloperConsole = lazy(() => import('./pages/DeveloperConsole'));
const PoliticianDashboard = lazy(() => import('./pages/PoliticianDashboard'));
const Compare = lazy(() => import('./pages/Compare'));
const ConstituencyMaps = lazy(() => import('./pages/ConstituencyMaps'));
const OpenData = lazy(() => import('./pages/OpenData'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const RTIGuidelines = lazy(() => import('./pages/RTIGuidelines'));
const PublicComplaints = lazy(() => import('./pages/PublicComplaints'));
const GamesArcade = lazy(() => import('./pages/GamesArcade'));
const GamePlayer = lazy(() => import('./pages/GamePlayer'));
import { AnimatePresence } from 'framer-motion';

initializeData();
// Sync with backend on startup
syncPoliticiansWithBackend().catch(() => console.debug('Initial backend sync failed, using local data'));
// Start auto-refresh scheduler (every 60 minutes)
if (typeof window !== 'undefined') {
  startAutoRefresh(60);
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Extracted Routes to use with AnimatePresence and useLocation
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/politician/:slug" element={<PoliticianProfile />} />
        <Route path="/rankings" element={<PoliticianRankings />} />
        <Route path="/volunteer" element={<NyayFauj />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/developer" element={<DeveloperConsole />} />
        <Route path="/politician-dashboard" element={<PoliticianDashboard />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/maps" element={<ConstituencyMaps />} />
        <Route path="/open-data" element={<OpenData />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/rti-guidelines" element={<RTIGuidelines />} />
        <Route path="/complaints" element={<PublicComplaints />} />
        <Route path="/games" element={<GamesArcade />} />
        <Route path="/games/play/:id" element={<GamePlayer />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen font-sans text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<div className="p-6 text-center text-sm text-slate-500">Loading...</div>}>
                <AnimatedRoutes />
              </Suspense>
            </main>
            <Footer />
            <AdminDataFetcher />
          </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
