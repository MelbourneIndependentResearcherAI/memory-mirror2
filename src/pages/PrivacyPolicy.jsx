import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Last Updated: February 23, 2026
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-green-900 dark:text-green-300">
              Our Privacy Commitment
            </h2>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Memory Mirror is built with privacy and security as top priorities. We are fully compliant with <strong>HIPAA</strong>, <strong>GDPR</strong>, and <strong>PIPEDA</strong> healthcare privacy regulations. Your data is encrypted, never sold, and only used to provide compassionate care to you and your loved ones.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                1. Information We Collect
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Account Information:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4 mb-4">
                <li>Name, email address, and contact details</li>
                <li>User profile (loved one's name, birth year, interests, favorite era)</li>
                <li>Caregiver relationship information</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Conversation Data:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4 mb-4">
                <li>Voice recordings and text transcripts of conversations with the AI</li>
                <li>Detected anxiety levels and emotional states</li>
                <li>Era detection and context awareness</li>
                <li>Conversation timestamps and duration</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Media and Memories:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4 mb-4">
                <li>Photos, videos, and audio files uploaded by caregivers</li>
                <li>Memory descriptions and personal stories</li>
                <li>Music preferences and playlists</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Usage and Device Data:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
                <li>Device type, operating system, and browser</li>
                <li>IP address and general location (city/country level)</li>
                <li>Feature usage patterns and interaction logs</li>
                <li>Crash reports and error diagnostics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                2. How We Use Your Information
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Core Service Delivery:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4 mb-4">
                <li>Provide personalized AI conversations adapted to user's mental state and era</li>
                <li>Detect anxiety and respond with appropriate calming techniques</li>
                <li>Recall relevant memories and photos during interactions</li>
                <li>Enable caregiver monitoring and insights</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Safety and Improvement:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4 mb-4">
                <li>Analyze trends to improve AI responses and features</li>
                <li>Generate proactive alerts for caregivers about concerning patterns</li>
                <li>Debug technical issues and optimize performance</li>
                <li>Train AI models to better support dementia care</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Communication:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
                <li>Send important updates about the Service</li>
                <li>Respond to support requests and feedback</li>
                <li>Notify about new features and improvements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                3. Data Security and Encryption
              </h2>
              <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  <strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Video calls use WebRTC with end-to-end encryption—no server recording.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  <strong>Access Control:</strong> Only you (the caregiver) and authorized healthcare providers can access your loved one's data. Memory Mirror staff do not access individual user data except for essential support or security purposes.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>HIPAA Compliance:</strong> All healthcare data is stored on HIPAA-compliant servers with strict audit trails. Business Associate Agreements (BAAs) are in place with all third-party processors.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                4. Data Sharing and Third Parties
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                <strong>We NEVER sell your data.</strong> We only share data in these limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li><strong>AI Service Providers:</strong> Conversation data is processed by trusted AI providers (OpenAI, ElevenLabs) under strict data processing agreements. Data is anonymized where possible.</li>
                <li><strong>Cloud Infrastructure:</strong> Data is stored on secure cloud servers (AWS, Supabase) with HIPAA-compliant configurations.</li>
                <li><strong>Analytics:</strong> Anonymized usage statistics help us improve the Service. No personal health information is included.</li>
                <li><strong>Legal Requirements:</strong> We may disclose data if required by law, court order, or to prevent imminent harm.</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                <strong>Family Sharing:</strong> Family members you explicitly invite to the Family Portal can view photos, messages, and well-being summaries you choose to share.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                5. Your Privacy Rights
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Under GDPR, PIPEDA, and HIPAA, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent for data processing at any time</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                To exercise these rights, email <a href="mailto:privacy@memorymirror.app" className="text-blue-600 hover:underline">privacy@memorymirror.app</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                6. Data Retention
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li><strong>Active Accounts:</strong> Data is retained as long as your account is active</li>
                <li><strong>Conversation History:</strong> Stored for up to 2 years (HIPAA requirement) unless you request earlier deletion</li>
                <li><strong>Deleted Accounts:</strong> Data is permanently deleted within 90 days, except where legally required to retain (e.g., audit trails)</li>
                <li><strong>Anonymized Analytics:</strong> Aggregate usage statistics may be retained indefinitely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                7. Children's Privacy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Memory Mirror is not intended for children under 18. We do not knowingly collect data from minors. If you believe a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                8. International Data Transfers
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Memory Mirror is operated from Australia. If you access the Service from outside Australia, your data may be transferred internationally. We use standard contractual clauses and ensure adequate protections are in place for all cross-border transfers in compliance with GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                9. Cookies and Tracking
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Memory Mirror uses minimal cookies:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
                <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and language</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns (anonymized)</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                You can control cookie preferences in your browser settings, but disabling essential cookies may impair functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                10. Changes to This Policy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We may update this Privacy Policy from time to time. Significant changes will be communicated via email or in-app notification at least 30 days before taking effect. The "Last Updated" date at the top will reflect the latest version.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                11. Contact and Data Protection Officer
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                For privacy concerns, data requests, or to speak with our Data Protection Officer:
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Email:</strong> privacy@memorymirror.app<br />
                  <strong>Support:</strong> support@memorymirror.app<br />
                  <strong>Creator:</strong> Mark McNamara<br />
                  <strong>Location:</strong> Sydney, New South Wales, Australia
                </p>
              </div>
            </section>

            <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6 mt-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic">
                Your privacy is our priority. We're committed to protecting your data and treating it with the respect and care it deserves.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to={createPageUrl('Landing')} className="hover:text-blue-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}