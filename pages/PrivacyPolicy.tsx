
import React from 'react';
import { Shield, Lock, Eye, Server, Mic, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-6"
          >
            <Shield size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-slate-500 text-lg"
          >
            Last Updated: October 24, 2025
          </motion.p>
        </div>

        {/* Content Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[32px] shadow-xl border border-slate-200 p-8 md:p-12 space-y-12"
        >
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed text-slate-600">
              At <strong>Neta</strong>, we believe transparency starts with us. This Privacy Policy outlines how we handle your data, specifically focusing on the sensitive nature of political participation, identity verification, and automated interactions. By using our platform, you trust us with your information, and we are committed to protecting that trust.
            </p>
          </section>

          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 mt-1">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">1. Identity Verification & Voter IDs</h2>
                <p className="text-slate-600 leading-relaxed">
                  To ensure the integrity of our "Verified Citizen Vote" feature, we require users to scan their Voter ID cards.
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-600">
                  <li><strong>Processing:</strong> We use advanced automated vision processing to extract the EPIC number from your image in real-time.</li>
                  <li><strong>Storage:</strong> We <span className="font-bold text-slate-900">DO NOT</span> store the image of your Voter ID card on our servers. Once the EPIC number is extracted and hashed, the image is discarded from memory.</li>
                  <li><strong>Hashing:</strong> Your EPIC number is converted into a cryptographic hash (SHA-256). We store only this hash to prevent duplicate voting, ensuring your voting history cannot be traced back to your real-world identity by us or any third party.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 mt-1">
                <Mic size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">2. Voice Assistant & Live Audio</h2>
                <p className="text-slate-600 leading-relaxed">
                  Neta features a "Live Voice Mode" powered by real-time audio processing APIs.
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-600">
                  <li><strong>Audio Transmission:</strong> When you activate the microphone, raw audio data is streamed directly to secure processing servers.</li>
                  <li><strong>Retention:</strong> Neta does not record or archive your voice conversations. Anonymized audio data may be retained by our processing partners for a short period to improve service quality, subject to strict enterprise privacy policies.</li>
                  <li><strong>Consent:</strong> The microphone is only active when you explicitly click "Start Voice Chat" or the microphone icon. You can revoke permissions at any time via your browser settings.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 mt-1">
                <Server size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">3. Data Collection & Usage</h2>
                <p className="text-slate-600 leading-relaxed">
                  We collect minimal data to facilitate civic engagement:
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-600">
                  <li><strong>Voluntary Profile Data:</strong> Name, State, and Constituency (if you choose to join the Nyay Fauj).</li>
                  <li><strong>Usage Data:</strong> We track aggregate metrics (e.g., "Most Viewed Politicians") to identify trending topics. This data is never linked to individual user profiles.</li>
                  <li><strong>Cookies:</strong> We use local storage to remember your preferences (e.g., Dark Mode, last visited state). We do not use third-party tracking cookies for advertising.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 mt-1">
                <Eye size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">4. Third-Party Services</h2>
                <p className="text-slate-600 leading-relaxed">
                  We utilize the following third-party services to provide our functionality:
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-600">
                  <li><strong>Automated Processing APIs:</strong> For generating politician summaries, analyzing comparison data, and processing voice/image inputs.</li>
                  <li><strong>Supabase/Firebase (Optional):</strong> If you log in, authentication services handle your credentials securely.</li>
                  <li><strong>RSS Feeds:</strong> News content is fetched directly from public RSS feeds of major news outlets. We do not control the content of these third-party sites.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Questions about your data? Contact our Data Protection Officer at <a href="mailto:privacy@neta.app" className="text-blue-600 font-bold hover:underline">privacy@neta.app</a>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
