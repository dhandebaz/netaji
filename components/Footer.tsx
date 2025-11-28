
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Twitter, Instagram, Heart, ShieldCheck, Github, Globe, ArrowRight, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const location = useLocation();

  // Hide footer on SuperAdmin pages to allow for immersive dashboard layout
  if (location.pathname.startsWith('/superadmin')) {
    return null;
  }

  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 overflow-hidden relative border-t border-slate-900">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* 1. Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
                N
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Neta</span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm text-sm">
              Building the digital infrastructure for Indian democracy. 
              We track, verify, and visualize political data to empower 1.4 billion citizens.
            </p>
            <div className="flex gap-3 pt-2">
              <SocialIcon icon={<Twitter size={18} />} href="#" label="Twitter" />
              <SocialIcon icon={<Instagram size={18} />} href="#" label="Instagram" />
              <SocialIcon icon={<Github size={18} />} href="#" label="GitHub" />
              <SocialIcon icon={<Globe size={18} />} href="#" label="Website" />
            </div>
          </div>

          {/* 2. Links Column (2 cols) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/election-analytics">Live Elections</FooterLink></li>
              <li><FooterLink to="/rankings">Leaderboard</FooterLink></li>
              <li><FooterLink to="/maps">Constituency Maps</FooterLink></li>
            </ul>
          </div>

          {/* 3. Links Column (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Community</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><FooterLink to="/volunteer">Nyay Fauj</FooterLink></li>
              <li><FooterLink to="/open-data">Open Data Portal</FooterLink></li>
              <li><FooterLink to="/developer">Developer API</FooterLink></li>
              <li><FooterLink to="/contact">Help Center</FooterLink></li>
            </ul>
          </div>

          {/* 4. Newsletter / CTA (4 cols -> 3 cols actually to fit 12) */}
          <div className="lg:col-span-3 lg:col-start-10">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Stay Informed</h4>
            <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 flex items-center focus-within:border-blue-600/50 transition-colors shadow-inner">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-transparent text-sm text-white placeholder-slate-500 px-4 py-2 w-full outline-none"
                />
                <button className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-colors shadow-md">
                    <ArrowRight size={16} />
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Weekly digests on parliament sessions and election analysis. No spam.
            </p>
            
            <div className="mt-8 flex items-center gap-3 p-4 bg-blue-950/30 rounded-xl border border-blue-900/50 backdrop-blur-sm">
                <ShieldCheck className="text-blue-400 shrink-0" size={20} />
                <div className="text-xs">
                    <span className="text-blue-200 font-bold block">Verified Data Source</span>
                    <span className="text-blue-400/80">Sourced from ECI Affidavits</span>
                </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm font-medium">
            <span className="text-slate-500">&copy; {new Date().getFullYear()} Neta Foundation</span>
            <div className="flex gap-6">
                <Link to="/privacy" className="hover:text-white transition-colors text-slate-500">Privacy</Link>
                <Link to="/terms" className="hover:text-white transition-colors text-slate-500">Terms</Link>
                <Link to="/rti-guidelines" className="hover:text-white transition-colors text-slate-500">RTI Guidelines</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 shadow-sm">
            <span>Made with</span>
            <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
            <span>in India</span>
            <span className="ml-1 text-lg leading-none">🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }: any) => (
  <Link to={to} className="text-slate-400 hover:text-blue-400 transition-colors hover:translate-x-1 inline-block duration-200">
    {children}
  </Link>
);

const SocialIcon = ({ icon, href, label }: any) => (
  <a 
    href={href} 
    aria-label={label}
    className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:-translate-y-1 border border-slate-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-900/20"
  >
    {icon}
  </a>
);

export default Footer;
