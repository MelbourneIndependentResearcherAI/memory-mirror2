import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-foreground p-4 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Privacy Policy</CardTitle>
            <p className="text-sm text-slate-400 mt-2">Last updated: 5 March 2026</p>
          </CardHeader>
        </Card>

        {/* Content */}
        <div className="space-y-6 text-slate-200">
          {/* Intro */}
          <p className="text-base leading-relaxed">
            Yes Technologies and Community Indigenous Corporation ("we", "our", "us") operates this mobile application ("the App"). This Privacy Policy explains how we handle personal information when you use the App.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            
            <p className="text-slate-300">
              The App does not collect personal data unless you voluntarily provide it (for example, through support requests or account information, if applicable). We do not request access to device permissions such as camera, microphone, location, contacts, or other sensitive permissions.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
            <p className="text-slate-300">
              Any information you voluntarily provide is used solely to improve your experience with the App and provide customer support when requested.
            </p>
            <p className="font-semibold text-white mb-2 mt-3">We do not:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-slate-300">
              <li>Collect or store sensitive device data</li>
              <li>Request device permissions</li>
              <li>Share your information with third parties</li>
              <li>Use your data for analytics, advertising, or tracking</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Storage and Security</h2>
            <p className="text-slate-300">
              We use industry-standard security measures to protect any optional information you provide. The App does not store sensitive personal data on our servers.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Device Permissions</h2>
            <p className="text-slate-300">
              This App does not request or use any device permissions. We do not access your camera, microphone, location, contacts, calendar, or any other sensitive device data.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Children's Privacy</h2>
            <p className="text-slate-300">
              The App complies with applicable children's privacy laws. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p className="text-slate-300 mb-3">Depending on your region, you may have rights to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-slate-300">
              <li>Access information you have voluntarily provided</li>
              <li>Request deletion of your data</li>
              <li>Contact us with privacy concerns</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Changes to This Policy</h2>
            <p className="text-slate-300">
              We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised "Last updated" date.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
            <p className="text-slate-300 mb-3">
              If you have questions or concerns about this Privacy Policy, you can contact us at:
            </p>
            <div className="space-y-2 text-slate-300">
              <p className="font-semibold text-white">Yes Technologies and Community Indigenous Corporation</p>
              <p>
                Email: <a href="mailto:mcnamaram86@gmail.com" className="text-purple-400 hover:text-purple-300 underline">
                  mcnamaram86@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}