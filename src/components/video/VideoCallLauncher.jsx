import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Shield, Lock, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import VideoCallInterface from './VideoCallInterface';

export default function VideoCallLauncher() {
  const [showCall, setShowCall] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const startCall = () => {
    if (!userName.trim() || !userEmail.trim()) {
      toast.error('Please enter your name and email');
      return;
    }

    if (!consentGiven) {
      toast.error('Please acknowledge the consent agreement');
      return;
    }

    setShowCall(true);
  };

  if (showCall) {
    return (
      <VideoCallInterface
        onClose={() => setShowCall(false)}
        userName={userName}
        userEmail={userEmail}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Video className="w-7 h-7 text-purple-600" />
            Secure Video Calling
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Face-to-face communication with end-to-end encryption
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Compliance Badges */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                E2E Encrypted
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 rounded-lg">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                HIPAA Compliant
              </span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/30 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                WCAG 2.1 AA
              </span>
            </div>
          </div>

          {/* Consent Section */}
          {!consentGiven && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-slate-700 dark:text-slate-300">
                <strong>Healthcare Video Call Consent</strong>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                  <li>Video calls use WebRTC with end-to-end encryption</li>
                  <li>No video/audio is recorded or stored on servers</li>
                  <li>Screen sharing available for remote assistance</li>
                  <li>Fully compliant with HIPAA, GDPR, and PIPEDA</li>
                  <li>Keyboard and screen reader accessible (WCAG 2.1 AA)</li>
                </ul>
                <Button
                  onClick={() => {
                    setConsentGiven(true);
                    toast.success('Consent acknowledged');
                  }}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 w-full"
                >
                  I Acknowledge and Consent
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* User Info Form */}
          {consentGiven && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    aria-required="true"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Features List */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video Call Features
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    HD video quality (up to 720p)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Echo cancellation & noise suppression
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Screen sharing for remote assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Video/audio toggle controls
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Fullscreen mode support
                  </li>
                </ul>
              </div>

              <Button
                onClick={startCall}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg h-14"
              >
                <Video className="w-5 h-5 mr-2" />
                Start Secure Video Call
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}