import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function FeatureLockGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Feature Lock System Guide
          </CardTitle>
          <CardDescription>
            Comprehensive guide to securing features and controlling patient access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lockfeatures">Lock Features</TabsTrigger>
              <TabsTrigger value="nightguard">Night Guard</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">What is Feature Lock?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Feature Lock allows caregivers to restrict patient access to specific app features. Once locked, patients cannot exit the feature without entering the caregiver PIN.
                </p>

                <h3 className="font-semibold text-lg mt-4">Key Capabilities:</h3>
                <ul className="space-y-2">
                  <li className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Lock individual features (Chat, Music, Photos, Banking)</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Whitelist multiple screens within a locked feature</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>PIN-protected exits for added security</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Special Night Guard lock for overnight care</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="lockfeatures" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">How to Lock Features</h3>
                
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm">Step 1: Navigate to Feature Lock Settings</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Go to Caregiver Settings → Feature Lock Control
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm">Step 2: Select Feature to Lock</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose from available features: Chat Mode, Music Therapy, Photo Library, Banking, Night Watch, etc.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm">Step 3: Configure PIN</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Set a 4-digit PIN that only you know. This is required to unlock features.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm">Step 4: Unlock When Needed</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    When patient tries to exit a locked feature, they'll be prompted for PIN. Only you can provide the PIN.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nightguard" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Night Guard Lock (Special Mode)</h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Night Guard Lock is a special mode designed for overnight care. It's more restrictive than regular feature locks.
                </p>

                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Night Guard Lock Features:
                  </h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-6 list-disc">
                    <li>Patient completely locked in Night Watch mode</li>
                    <li>Cannot access other features</li>
                    <li>Cannot exit without caregiver PIN</li>
                    <li>Status indicator always visible</li>
                    <li>Perfect for overnight supervision</li>
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm">How to Activate Night Guard:</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Go to Night Watch Mode → Caregiver Control Panel → Activate Night Guard Lock. Patient is then locked in place for the duration.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faqs" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">What if I forget my PIN?</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Contact admin support to reset. For security, there's no "reset PIN" button for patients to find.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Can multiple carers have different PINs?</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Currently, there's one PIN per patient profile shared across carers. Future versions will support individual PINs.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">What happens if patient tries to force exit?</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    They'll see a lock screen and be prompted for PIN. Without it, they cannot proceed. Navigation buttons are disabled.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Can I lock multiple features at once?</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Yes! You can lock Chat, Music, Photos, Banking, etc. simultaneously. Each has its own lock status.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Is Night Guard lock stronger than regular lock?</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Yes. Night Guard explicitly prevents access to other features and shows a warning banner that only carers can unlock.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}