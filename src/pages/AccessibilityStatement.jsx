import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-950 dark:to-blue-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Accessibility Statement</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Memory Mirror is committed to digital accessibility for all users
          </p>
        </div>

        {/* Compliance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                WCAG 2.1 Level AA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                This application conforms to WCAG 2.1 Level AA standards for accessibility, ensuring compatibility with assistive technologies.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                Section 508 Compliant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Meets US Section 508 Amendment requirements for federal agencies and government contractors.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Accessibility Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Key Accessibility Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Vision Support</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ High contrast mode for low vision users</li>
                  <li>✓ Adjustable text sizing (up to 24px)</li>
                  <li>✓ Color-blind friendly color schemes</li>
                  <li>✓ Screen reader compatible (NVDA, JAWS, VoiceOver)</li>
                  <li>✓ Alt text for all images</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Motor & Mobility</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Full keyboard navigation support</li>
                  <li>✓ Focus indicators visible on all interactive elements</li>
                  <li>✓ Large touch targets (minimum 44×44px)</li>
                  <li>✓ Voice control compatible</li>
                  <li>✓ No content hidden on hover/focus</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Hearing Support</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Captions for all video content</li>
                  <li>✓ Transcripts provided for audio</li>
                  <li>✓ Visual feedback for audio events</li>
                  <li>✓ No critical information conveyed by sound alone</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Elderly Users (80+)</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Simple, predictable navigation</li>
                  <li>✓ Enhanced text spacing (1.8x line height)</li>
                  <li>✓ Larger default font sizes</li>
                  <li>✓ Reduced animation and motion</li>
                  <li>✓ Clear, simple language</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Browser & Device Support */}
        <Card>
          <CardHeader>
            <CardTitle>Browser & Device Compatibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Desktop Browsers</h4>
                <p>Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Mobile Devices</h4>
                <p>iOS 14+, Android 10+, with TalkBack and VoiceOver support</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Assistive Technologies</h4>
                <p>NVDA, JAWS, VoiceOver, TalkBack, Dragon NaturallySpeaking, switch control</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Known Issues */}
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              Known Accessibility Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                While we strive for full accessibility, some third-party embedded content may have limitations. We are working to address these issues.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded">
                <p className="text-xs">
                  <strong>Current:</strong> Some video content requires manual caption updates. We aim to resolve this by Q3 2026.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Need Accessibility Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Keyboard Shortcut:</strong> Press <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Alt+A</code> to open accessibility settings anytime.
            </p>
            <p>
              <strong>Having issues?</strong> Contact our accessibility team:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Email: accessibility@memorymirror.com</li>
              <li>Phone: +1-800-MEMORY-1 (TTY available)</li>
              <li>Response time: Within 24 business hours</li>
            </ul>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Last updated: February 2026 | Next review: August 2026
        </p>
      </div>
    </div>
  );
}