import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 gap-2 text-blue-600 dark:text-blue-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Last Updated: February 16, 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Introduction</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Memory Mirror ("we," "us," "our," or "Company") operates the Memory Mirror mobile application (the "App"). This Privacy Policy explains our data practices, including what information we collect, how we use it, and your rights regarding your data.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Memory Mirror is designed specifically for individuals living with dementia and their caregivers. We take data privacy and security extremely seriously, especially given the sensitive health information involved.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">2.1 Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Full name, email address, phone number</li>
              <li>Date of birth</li>
              <li>Relationship information (family members, caregivers)</li>
              <li>Emergency contact details</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">2.2 Health & Cognitive Information</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Dementia stage/cognitive level (mild, moderate, advanced, severe)</li>
              <li>Anxiety level assessments</li>
              <li>Mood observations</li>
              <li>Health conditions and medical history</li>
              <li>Medication schedules</li>
              <li>Daily activity logs</li>
              <li>Cognitive assessment results</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">2.3 Voice & Audio Data</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Voice recordings (wake word detection)</li>
              <li>Conversation transcripts with AI companion</li>
              <li>Voice commands and responses</li>
              <li>Audio recordings from family members</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">2.4 Media & Content</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Photos and videos uploaded by family members</li>
              <li>Music files and playlists</li>
              <li>Stories and memories</li>
              <li>Journal entries and notes</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">2.5 App Usage Data</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Feature usage and interaction patterns</li>
              <li>Time spent in different modes (chat, phone, security)</li>
              <li>Night Watch activations and incidents</li>
              <li>Device type and operating system</li>
              <li>Error logs and crash reports</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>App Functionality:</strong> To provide core features like AI conversation, voice recognition, and Night Watch monitoring</li>
              <li><strong>Personalization:</strong> To tailor AI responses based on user profile, cognitive level, and preferred era</li>
              <li><strong>Safety & Monitoring:</strong> To detect anxiety, confusion, or distress and alert caregivers</li>
              <li><strong>Analytics:</strong> To understand feature usage and improve the app</li>
              <li><strong>Health Insights:</strong> To generate cognitive trends and anxiety reports for caregivers</li>
              <li><strong>Customer Support:</strong> To troubleshoot issues and improve user experience</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Data Sharing & Third Parties</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">4.1 AI Service Providers</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Your conversation messages, user profile, and health assessments are shared with our AI service providers (including OpenAI, Google AI, or similar LLM providers) for real-time processing and response generation. This sharing is necessary for core app functionality. All data is encrypted in transit (HTTPS/TLS).
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">4.2 Cloud Infrastructure</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Data is stored on Base44's HIPAA-compliant cloud infrastructure. We do not share data with non-service providers.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">4.3 No Data Sales</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We do NOT sell, rent, or trade your personal or health data. We do NOT share data with advertisers, marketers, or data brokers.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">4.4 Family Members</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Caregivers can access health data, activity logs, and insights for the person they're caring for. Family members can access photos, messages, and media they've uploaded.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Data Security</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>Encryption in Transit:</strong> All data transmitted via HTTPS/TLS encryption</li>
              <li><strong>Encryption at Rest:</strong> All stored data is encrypted using industry-standard AES-256</li>
              <li><strong>Access Controls:</strong> Role-based access (patients, caregivers, admins have different permissions)</li>
              <li><strong>Authentication:</strong> Secure password requirements and session management</li>
              <li><strong>Regular Audits:</strong> Regular security assessments and penetration testing</li>
              <li><strong>Incident Response:</strong> We have procedures to detect and respond to data breaches</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>Conversation History:</strong> Retained indefinitely unless user deletes. Deleted records are permanently purged.</li>
              <li><strong>Voice Recordings:</strong> Retained for 90 days, then automatically deleted (unless explicitly saved by user)</li>
              <li><strong>Activity Logs:</strong> Retained for 1 year for trend analysis, then deleted</li>
              <li><strong>Health Data:</strong> Retained for medical record purposes. Can be exported or deleted anytime.</li>
              <li><strong>Account Data:</strong> Deleted within 30 days of account deletion request</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Your Rights & Control</h2>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">You have the right to:</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>Access:</strong> View all data we collect about you</li>
              <li><strong>Export:</strong> Download your data in JSON/CSV format</li>
              <li><strong>Delete:</strong> Request deletion of specific conversations or your entire account</li>
              <li><strong>Correct:</strong> Update or correct inaccurate information</li>
              <li><strong>Pause:</strong> Temporarily disable voice listening or specific features</li>
              <li><strong>Opt-Out:</strong> Opt out of analytics and usage tracking</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              To exercise these rights, contact us at support@memorymirror.app
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Legal Basis for Processing</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We process your data under the following legal bases:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>Consent:</strong> You consent to data collection and use</li>
              <li><strong>Contract:</strong> Data processing is necessary to provide app services</li>
              <li><strong>Legal Obligation:</strong> Compliance with healthcare and privacy regulations</li>
              <li><strong>Legitimate Interest:</strong> To improve app quality and safety</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. International Data Transfers</h2>
            <p className="text-slate-700 dark:text-slate-300">
              Your data may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your home country. By using Memory Mirror, you consent to such transfers. We implement appropriate safeguards such as Standard Contractual Clauses and encryption.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. HIPAA Compliance</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Memory Mirror is HIPAA-compliant and treats all health information as Protected Health Information (PHI). We have implemented physical, technical, and administrative safeguards to protect your data.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              We are not a covered entity under HIPAA, but we comply with HIPAA standards for data security and privacy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. GDPR Compliance</h2>
            <p className="text-slate-700 dark:text-slate-300">
              If you are in the European Union, you have additional rights under GDPR including the right to data portability and the right to lodge a complaint with a data protection authority.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Children's Privacy</h2>
            <p className="text-slate-700 dark:text-slate-300">
              Memory Mirror is not designed for children under 13. We do not knowingly collect data from children under 13. If we become aware of such collection, we will delete it immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">13. California Privacy Rights (CCPA)</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              California residents have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Know what personal data is collected</li>
              <li>Know whether personal data is sold or shared</li>
              <li>Delete personal data</li>
              <li>Opt-out of the "sale" of personal data</li>
              <li>Non-discrimination for exercising CCPA rights</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              To exercise CCPA rights, contact us at privacy@memorymirror.app
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">14. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 dark:text-slate-300">
              We may update this Privacy Policy periodically. We will notify you of material changes by updating the "Last Updated" date and posting the revised policy on our website. Your continued use of Memory Mirror constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">15. Contact Us</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              If you have questions about this Privacy Policy or our data practices:
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Email:</strong> support@memorymirror.app
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Phone:</strong> 1-800-MEMORY-1 (24/7)
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Mailing Address:</strong> Memory Mirror Privacy Team, PO Box 12345, San Francisco, CA 94105
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">16. Data Protection Officer</h2>
            <p className="text-slate-700 dark:text-slate-300">
              For privacy concerns related to GDPR or other data protection regulations, you can contact our Data Protection Officer at dpo@memorymirror.app
            </p>
          </section>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            This Privacy Policy was last updated on February 16, 2026. We are committed to protecting your privacy and providing transparency about our data practices.
          </p>
        </div>
      </div>
    </div>
  );
}