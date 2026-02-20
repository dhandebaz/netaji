
import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 md:px-8 font-sans">
      <Helmet>
        <title>Terms of Service | Neta</title>
        <meta
          name="description"
          content="Read the terms of service governing your use of the Neta platform for political transparency."
        />
        <link rel="canonical" href="https://neta.ink/terms" />
        <meta property="og:title" content="Terms of Service | Neta" />
        <meta
          property="og:description"
          content="Legal terms, liability limits, and usage policies for the Neta civic technology platform."
        />
        <meta property="og:url" content="https://neta.ink/terms" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-2xl mb-6"
          >
            <FileText size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
          >
            Terms of Service
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-slate-500 text-lg"
          >
            Effective Date: October 24, 2025
          </motion.p>
        </div>

        {/* Content Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[32px] shadow-xl border border-slate-200 p-8 md:p-12 space-y-12"
        >
          {/* 1. Acceptance */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using the Neta platform, you agree to be bound by these Terms of Service. Neta is a civic technology platform designed to aggregate public political data. We are a non-partisan, non-governmental entity.
            </p>
          </section>

          {/* 2. Data Accuracy */}
          <section>
            <div className="flex items-start gap-4">
               <div className="mt-1 text-orange-500"><AlertTriangle size={24} /></div>
               <div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Disclaimer of Data Accuracy</h2>
                 <p className="text-slate-600 leading-relaxed mb-4">
                   The data presented on Neta regarding politician assets, criminal cases, and educational records is sourced primarily from:
                 </p>
                 <ul className="list-disc pl-5 space-y-2 text-slate-600">
                    <li>Self-sworn affidavits (Form 26) filed by candidates with the Election Commission of India (ECI).</li>
                    <li>Publicly available archives (e.g., MyNeta.info).</li>
                    <li>Algorithmic analysis powered by automated systems.</li>
                 </ul>
                 <p className="text-slate-600 leading-relaxed mt-4 font-medium">
                    While we strive for accuracy, Neta does not guarantee the completeness or correctness of this data. Users should verify information with official ECI documents before taking legal or voting actions.
                 </p>
               </div>
            </div>
          </section>

          {/* 3. User Conduct */}
          <section>
            <div className="flex items-start gap-4">
               <div className="mt-1 text-green-600"><CheckCircle size={24} /></div>
               <div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Conduct & RTI</h2>
                 <p className="text-slate-600 leading-relaxed mb-4">
                   Our "Nyay Fauj" and "RTI Generator" tools are designed to empower citizens. By using them, you agree:
                 </p>
                 <ul className="list-disc pl-5 space-y-2 text-slate-600">
                    <li>To not use the platform to harass, defame, or intimidate public officials.</li>
                    <li>To ensure any RTI applications filed using our templates comply with the RTI Act, 2005.</li>
                    <li>That Neta is not a law firm and does not provide legal advice. The RTI drafts generated are for educational and convenience purposes only.</li>
                 </ul>
               </div>
            </div>
          </section>

          {/* 4. Limitation of Liability */}
          <section>
            <div className="flex items-start gap-4">
               <div className="mt-1 text-blue-600"><Scale size={24} /></div>
               <div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitation of Liability</h2>
                 <p className="text-slate-600 leading-relaxed">
                   To the fullest extent permitted by law, Neta and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the platform or any content on the platform.
                 </p>
               </div>
            </div>
          </section>

          {/* 5. Automated Usage */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Automated Content</h2>
            <p className="text-slate-600 leading-relaxed">
              Portions of the content, including "Politician Summaries," "Comparisons," and "Voice Responses," are generated by automated algorithms. Automated systems can produce errors or biased results. Users must exercise critical judgment when interpreting automated insights.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
