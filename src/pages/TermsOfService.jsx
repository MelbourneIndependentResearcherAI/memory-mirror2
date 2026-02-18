import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Last Updated: February 18, 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              By accessing or using Memory Mirror (the "App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              These Terms apply to all users worldwide, including users in the United States, European Union, United Kingdom, Australia, Canada, and all other jurisdictions.
            </p>
          </section>

          <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-700 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-400 mb-4 flex items-center gap-2">
              ⚠️ Important Legal Disclaimer
            </h2>
            <p className="text-slate-800 dark:text-slate-200 mb-3 font-semibold">
              MEMORY MIRROR IS NOT A MEDICAL DEVICE AND IS NOT INTENDED TO DIAGNOSE, TREAT, CURE, OR PREVENT ANY DISEASE OR MEDICAL CONDITION.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>Not a substitute for professional medical care:</strong> Memory Mirror does not replace doctors, nurses, medical professionals, or in-person caregiving</li>
              <li><strong>Not for emergencies:</strong> In case of medical emergency, call emergency services (911, 999, 112, etc.) immediately</li>
              <li><strong>Supervision required:</strong> Memory Mirror should be used under the supervision of a qualified caregiver or family member</li>
              <li><strong>Companion tool only:</strong> This app is a companionship and support tool designed to complement professional dementia care, not replace it</li>
              <li><strong>No medical advice:</strong> The AI does not provide medical advice, diagnosis, or treatment recommendations</li>
            </ul>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Eligibility & User Responsibilities</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">2.1 Age & Capacity</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You must be at least 18 years of age to create an account. If you are a caregiver setting up Memory Mirror for someone with dementia, you represent that you have legal authority to act on their behalf.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">2.2 Caregiver Responsibility</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              As a caregiver, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>You are responsible for the safety and wellbeing of the person in your care</li>
              <li>You will not rely solely on Memory Mirror for care and supervision</li>
              <li>You will regularly monitor your loved one's use of the app</li>
              <li>You will seek professional medical advice for any health concerns</li>
              <li>You understand the app is a support tool, not a replacement for human care</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">2.3 Proper Use</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You agree to use Memory Mirror only for its intended purpose as a dementia care companion. You will not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Use the app for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to other users' data</li>
              <li>Use the app to harm, harass, or exploit any individual</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Use automated systems (bots, scrapers) to access the app</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Limitation of Liability</h2>
            
            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-400 dark:border-red-700 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mb-3">CRITICAL LIABILITY DISCLAIMER</h3>
              <p className="text-slate-800 dark:text-slate-200 mb-3 font-semibold uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>NO WARRANTY:</strong> Memory Mirror is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, either express or implied</li>
                <li><strong>NO LIABILITY FOR DAMAGES:</strong> We are not liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages</li>
                <li><strong>NO LIABILITY FOR HARM:</strong> We are not liable for any physical, emotional, psychological, or financial harm resulting from app use</li>
                <li><strong>NO LIABILITY FOR AI ERRORS:</strong> We are not liable for any incorrect, misleading, or harmful AI responses or suggestions</li>
                <li><strong>NO LIABILITY FOR TECHNICAL FAILURES:</strong> We are not liable for app downtime, data loss, security breaches, or technical malfunctions</li>
                <li><strong>NO LIABILITY FOR THIRD PARTIES:</strong> We are not liable for actions of third-party services (AI providers, cloud storage, etc.)</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">Maximum Liability Cap</h3>
            <p className="text-slate-700 dark:text-slate-300">
              In jurisdictions where liability cannot be fully excluded, our total liability to you for all claims arising from or related to the App shall not exceed the amount you paid for the App in the 12 months preceding the claim, or $100 USD, whichever is greater.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Indemnification</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You agree to indemnify, defend, and hold harmless Memory Mirror, its developers, owners, employees, contractors, and affiliates from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Your use or misuse of the App</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another person or entity</li>
              <li>Any harm, injury, or damage to yourself or others related to app use</li>
              <li>Any negligent or wrongful acts or omissions by you or those under your supervision</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. AI-Generated Content Disclaimer</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Memory Mirror uses artificial intelligence (AI) to generate responses and interactions. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>AI is imperfect:</strong> AI may produce incorrect, inappropriate, or unexpected responses</li>
              <li><strong>No guarantee of accuracy:</strong> We do not guarantee the accuracy, completeness, or reliability of AI-generated content</li>
              <li><strong>Human oversight required:</strong> All AI interactions should be monitored by caregivers</li>
              <li><strong>Continuous learning:</strong> The AI learns over time but may still make mistakes</li>
              <li><strong>Not personalized medical advice:</strong> AI responses are general in nature and not tailored medical recommendations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Subscription & Billing</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">6.1 Free Tier</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Memory Mirror offers a free tier with limited daily usage. Free features may be modified or discontinued at any time without notice.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">6.2 Premium Subscription</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Premium subscriptions are $9.99/month. By subscribing, you authorize us to charge your payment method on a recurring monthly basis until you cancel.
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <p className="text-slate-800 dark:text-slate-200 mb-3 font-semibold">
                <strong>Important:</strong> Subscription billing will not begin until Memory Mirror is running smoothly and all final development is complete. We will notify you before billing starts.
              </p>
              <p className="text-slate-700 dark:text-slate-300 italic">
                Thank you for your patience and support during our development phase. We are committed to delivering a reliable, high-quality experience before charging any fees.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">6.3 Cancellation & Refunds</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You may cancel your subscription at any time. No refunds will be provided for partial months. All sales are final except where required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Data Collection & Privacy</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Our collection, use, and protection of your data is governed by our <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 underline">Privacy Policy</a>. By using Memory Mirror, you consent to data collection as described in the Privacy Policy.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              We collect sensitive health information including dementia stage, cognitive assessments, anxiety levels, conversation transcripts, and voice recordings. This data is necessary for app functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Intellectual Property</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Memory Mirror, its design, features, code, and all related intellectual property are owned by Memory Mirror and protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              You are granted a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes only.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Third-Party Services</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Memory Mirror integrates with third-party services including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>AI providers (OpenAI, Google AI, or similar)</li>
              <li>Cloud storage providers</li>
              <li>Speech recognition services</li>
              <li>Smart home device APIs</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              Your use of these third-party services is subject to their respective terms and privacy policies. We are not responsible for the actions, content, or policies of third-party services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Termination</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We reserve the right to suspend or terminate your access to Memory Mirror at any time, with or without notice, for any reason, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of subscription fees</li>
              <li>Abusive behavior toward support staff</li>
              <li>Use of the app in a manner that harms others or the service</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              You may delete your account at any time. Upon termination, your data will be deleted according to our data retention policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Governing Law & Jurisdiction</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">11.1 Governing Law</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              These Terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">11.2 International Users</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              If you are accessing Memory Mirror from outside the United States, you agree to comply with all local laws regarding online conduct and acceptable content. You are responsible for compliance with any applicable laws in your jurisdiction.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">11.3 Dispute Resolution</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Any disputes arising from these Terms or your use of the App shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except where prohibited by law.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              <strong>Class Action Waiver:</strong> You agree to bring claims against us only in your individual capacity and not as a plaintiff or class member in any class or representative action.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Regional Compliance</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">12.1 United States - HIPAA</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Memory Mirror complies with HIPAA standards for data security but is not a covered entity. We treat all health information as Protected Health Information (PHI).
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">12.2 European Union - GDPR</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              EU users have additional rights under GDPR including data portability, right to erasure, and right to lodge complaints with supervisory authorities.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">12.3 California - CCPA</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              California residents have rights to know what personal information is collected, request deletion, and opt-out of data "sales" (we do not sell data).
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">12.4 Australia - Privacy Act</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Australian users' personal information is protected under the Australian Privacy Act 1988 and Australian Privacy Principles (APPs).
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">12.5 Canada - PIPEDA</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Canadian users are protected under the Personal Information Protection and Electronic Documents Act (PIPEDA).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">13. Changes to Terms</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email or in-app notification. Your continued use of Memory Mirror after changes constitutes acceptance of the modified Terms.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              If you do not agree to the modified Terms, you must stop using the App and may request account deletion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">14. Severability</h2>
            <p className="text-slate-700 dark:text-slate-300">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">15. Contact Information</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              For questions about these Terms or to report violations:
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Email:</strong> legal@memorymirror.app
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Support:</strong> support@memorymirror.app
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Mailing Address:</strong> Memory Mirror Legal Team, PO Box 12345, San Francisco, CA 94105
              </p>
            </div>
          </section>

          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl mt-12">
            <p className="text-slate-700 dark:text-slate-300 mb-3 font-semibold">
              By using Memory Mirror, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last updated: February 18, 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}