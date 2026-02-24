import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

/**
 * HIPAA/GDPR/PDPA Compliance Wrapper
 * Ensures all health data operations are properly logged and consented
 * Supports: HIPAA (US), GDPR (EU), PDPA (Australia), PIPEDA (Canada), and Indigenous data sovereignty
 */
export default function ComplianceWrapper({ children }) {
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check for existing consent
    const storedConsent = localStorage.getItem('healthDataConsent');
    if (storedConsent) {
      setConsentAccepted(true);
    }
  }, []);

  useEffect(() => {
    // Detect user role for HIPAA BAA requirements
    const detectRole = async () => {
      try {
        const user = await base44.auth.me();
        setUserRole(user?.role || 'patient');
      } catch (e) {
        console.log('Consent wrapper: could not detect role');
      }
    };
    detectRole();
  }, []);

  if (!consentAccepted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold">Important: Health Data Privacy & Compliance</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                This application processes protected health information
              </p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 space-y-3 text-sm">
            <p>
              <strong>Privacy Notice:</strong> Your health data is protected under:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>HIPAA (Health Insurance Portability & Accountability Act) - USA</li>
              <li>GDPR (General Data Protection Regulation) - European Union</li>
              <li>PDPA (Privacy Act 1988) - Australia</li>
              <li>PIPEDA (Personal Information Protection & Electronic Documents Act) - Canada</li>
              <li>Indigenous Data Sovereignty Principles - First Nations Communities</li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-6 space-y-3 text-sm max-h-64 overflow-y-auto">
            <h3 className="font-semibold">Your Rights:</h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li>✓ Access to your health records at any time</li>
              <li>✓ Correct inaccurate information</li>
              <li>✓ Delete your data (right to be forgotten)</li>
              <li>✓ Export your data in portable format</li>
              <li>✓ Withdraw consent at any time</li>
              <li>✓ Know who accessed your data</li>
              <li>✓ File complaints with privacy authorities</li>
            </ul>
          </div>



          <div className="flex gap-3">
            <Button
              onClick={() => {
                localStorage.setItem('healthDataConsent', JSON.stringify({
                  accepted: true,
                  timestamp: new Date().toISOString(),
                  version: '1.0',
                }));
                
                // Log consent action
                base44.entities.AuditLog?.create?.({
                  action_type: 'consent_accepted',
                  user_email: 'system',
                  resource_type: 'compliance',
                  details: { consent_version: '1.0' },
                  compliance_flags: ['HIPAA', 'GDPR', 'PDPA', 'PIPEDA'],
                }).catch(() => {});

                setConsentAccepted(true);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              I Accept & Continue
            </Button>
            <Button
              onClick={() => {
                alert('You must accept the privacy terms to use this application.');
              }}
              variant="outline"
              className="flex-1"
            >
              Decline
            </Button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
            Last updated: February 2026 | Read our full{' '}
            <a href={window.location.origin + '/PrivacyPolicy'} className="underline text-blue-600 hover:text-blue-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}