import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FileText className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Last Updated: February 23, 2026
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                1. Agreement to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                By accessing and using Memory Mirror ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. Memory Mirror is operated by Mark McNamara ("we," "us," or "our") and is designed specifically for individuals with dementia and their caregivers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                2. Description of Service
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Memory Mirror is an AI-powered companion application that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li>Voice-activated conversation and emotional support</li>
                <li>Era-adaptive dialogue (1940s, 1960s, 1980s, present day)</li>
                <li>Anxiety detection and calming techniques</li>
                <li>Memory recall and photo sharing</li>
                <li>Phone Mode and Security Scanner (non-functional safety reassurance)</li>
                <li>Caregiver monitoring dashboard and family portal</li>
                <li>Smart home integration and mood-based automations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                3. Medical Disclaimer
              </h2>
              <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-6">
                <p className="text-slate-800 dark:text-slate-200 font-semibold mb-2">
                  IMPORTANT: Memory Mirror is NOT a medical device.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Memory Mirror is a supportive companion tool and does not provide medical advice, diagnosis, or treatment. It is not a substitute for professional medical care, therapy, or emergency services. Always consult qualified healthcare professionals for medical decisions. In emergencies, call your local emergency services (911, 000, 112, etc.) - never rely on Memory Mirror's simulated Phone Mode or Security Scanner.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                4. User Eligibility
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                The Service is intended for individuals with dementia and their caregivers who are 18 years or older. If setting up Memory Mirror for someone else, you confirm you are their legal caregiver or have their consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                5. Pricing and Payments
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                <strong>Current Status:</strong> Memory Mirror is currently 100% free while in active development.
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                <strong>Future Subscription:</strong> When we introduce the $9.99/month premium subscription:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li>We will provide at least 30 days advance notice</li>
                <li>Subscription will not begin until the Service is fully polished</li>
                <li>You can cancel anytime with no penalties</li>
                <li>Refund policy will be clearly communicated at subscription launch</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                6. Data and Privacy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Your privacy is paramount. Memory Mirror is fully compliant with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li><strong>HIPAA</strong> (Health Insurance Portability and Accountability Act)</li>
                <li><strong>GDPR</strong> (General Data Protection Regulation)</li>
                <li><strong>PIPEDA</strong> (Personal Information Protection and Electronic Documents Act)</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                Please review our <Link to={createPageUrl('PrivacyPolicy')} className="text-blue-600 hover:underline">Privacy Policy</Link> for complete details on data collection, use, and protection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                7. Acceptable Use
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                You agree to use Memory Mirror only for its intended compassionate care purposes. You must NOT:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li>Use the Service for illegal activities</li>
                <li>Attempt to hack, reverse engineer, or compromise security</li>
                <li>Share your account credentials with unauthorized persons</li>
                <li>Upload malicious content or spam</li>
                <li>Use the Service to harm, harass, or deceive others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                8. Intellectual Property
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Memory Mirror and all its components, including but not limited to software, design, text, graphics, and AI models, are the intellectual property of Mark McNamara. Unauthorized copying, distribution, or modification is strictly prohibited. The music library uses only royalty-free and public domain sources.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                9. Third-Party Services
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Memory Mirror integrates with third-party services including AI providers, voice synthesis, and smart home devices. We are not responsible for the performance, security, or privacy practices of these external services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                10. Limitation of Liability
              </h2>
              <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  To the fullest extent permitted by law, Memory Mirror and its creator shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. This includes but is not limited to: loss of data, emotional distress, missed medical emergencies, or reliance on AI-generated content. The Service is provided "as is" without warranties of any kind.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                11. Modifications to Service
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any aspect of Memory Mirror at any time, with or without notice. We will make reasonable efforts to communicate significant changes to active users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                12. Termination
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                You may stop using Memory Mirror at any time. We reserve the right to terminate or suspend your access for violations of these Terms or for any reason, with or without notice. Upon termination, your data will be handled according to our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                13. Governing Law
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                These Terms are governed by the laws of New South Wales, Australia, without regard to conflict of law principles. Disputes will be resolved in the courts of Sydney, Australia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                14. Changes to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We may update these Terms from time to time. Significant changes will be communicated via email or in-app notification. Continued use of Memory Mirror after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                15. Contact Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                For questions about these Terms or Memory Mirror:
              </p>
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Email:</strong> support@memorymirror.app<br />
                  <strong>Creator:</strong> Mark McNamara<br />
                  <strong>Location:</strong> Sydney, Australia
                </p>
              </div>
            </section>

            <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6 mt-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic">
                By using Memory Mirror, you acknowledge that you have read, understood, and agree to these Terms of Service.
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