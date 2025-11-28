
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { initializeData, syncPoliticiansWithBackend } from './services/dataService';
import { AdminDataFetcher } from './components/AdminDataFetcher';
import { ErrorBoundary } from './components/ErrorBoundary';
import { startAutoRefresh } from './services/dataRefreshScheduler';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import PoliticianProfile from './pages/PoliticianProfile';
import PoliticianRankings from './pages/PoliticianRankings';
import NyayFauj from './pages/NyayFauj';
import SuperAdmin from './pages/SuperAdmin';
import DeveloperConsole from './pages/DeveloperConsole';
import PoliticianDashboard from './pages/PoliticianDashboard';
import Compare from './pages/Compare';
import ConstituencyMaps from './pages/ConstituencyMaps';
import OpenData from './pages/OpenData';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RTIGuidelines from './pages/RTIGuidelines';
import ElectionAnalytics from './pages/ElectionAnalytics';
import PublicComplaints from './pages/PublicComplaints';
import GamesArcade from './pages/GamesArcade';
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
        <Route path="/election-analytics" element={<ElectionAnalytics />} />
        <Route path="/complaints" element={<PublicComplaints />} />
        <Route path="/games" element={<GamesArcade />} />
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
              <AnimatedRoutes />
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
