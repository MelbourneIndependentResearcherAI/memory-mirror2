import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Unlock, AlertTriangle, Save } from 'lucide-react';
import { useFeatureLock } from '@/components/FeatureLockManager';

const AVAILABLE_FEATURES = [
  { id: 'NightWatch', name: 'Night Watch Mode', description: 'Overnight monitoring and care' },
  { id: 'ChatMode', name: 'Chat Mode', description: 'Voice and text conversation' },
  { id: 'PhoneMode', name: 'Phone Mode', description: 'Quick phone call access' },
  { id: 'MusicTherapy', name: 'Music Therapy', description: 'Music and audio features' },
  { id: 'PhotoLibrary', name: 'Photo Library', description: 'Family photos and memories' },
  { id: 'MyBank', name: 'Banking Features', description: 'Banking and finances' }
];

export default function FeatureLockSettings() {
  const { lockConfigs, lockFeature, unlockFeature, updateCaregiverPin } = useFeatureLock();
  const [_selectedFeature, setSelectedFeature] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [whitelistedScreens] = useState({});

  const _handleLockFeature = (featureId) => {
    const screens = whitelistedScreens[featureId] || [];
    lockFeature(featureId, screens);
    setSelectedFeature(null);
  };

  const handleUnlockFeature = (featureId) => {
    const config = lockConfigs[featureId];
    if (config?.locked) {
      unlockFeature(featureId, '1234'); // In real app, would need PIN
    }
  };

  const handleSavePin = async () => {
    if (!newPin || !confirmPin) {
      setPinError('Please enter PIN in both fields');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinError('PIN must be 4 digits');
      return;
    }

    try {
      await updateCaregiverPin(newPin);
      setPinSuccess(true);
      setNewPin('');
      setConfirmPin('');
      setPinError('');
      setTimeout(() => setPinSuccess(false), 3000);
    } catch {
      setPinError('Failed to save PIN');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Feature Lock Settings
          </CardTitle>
          <CardDescription>
            Lock features to restrict patient access and require caregiver PIN to exit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {AVAILABLE_FEATURES.map((feature) => {
              const config = lockConfigs[feature.id];
              const isLocked = config?.locked === true;

              return (
                <div key={feature.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{feature.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                      
                      {isLocked && config.whitelistedScreens?.length > 0 && (
                        <div className="mt-2 text-xs text-slate-500">
                          <span className="font-medium">Accessible screens:</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {config.whitelistedScreens.map(screen => (
                              <span key={screen} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                {screen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {config?.nightGuardOnly && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          Night Guard Lock Active
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {isLocked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlockFeature(feature.id)}
                          className="gap-1"
                        >
                          <Unlock className="w-4 h-4" />
                          Unlock
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFeature(feature.id)}
                          className="gap-1"
                        >
                          <Lock className="w-4 h-4" />
                          Lock
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caregiver PIN</CardTitle>
          <CardDescription>
            Set a secure 4-digit PIN to unlock locked features. Keep this PIN private.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">New PIN</label>
              <Input
                type="password"
                placeholder="••••"
                maxLength="4"
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setPinError('');
                }}
                className="text-center text-lg font-bold tracking-widest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm PIN</label>
              <Input
                type="password"
                placeholder="••••"
                maxLength="4"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setPinError('');
                }}
                className="text-center text-lg font-bold tracking-widest"
              />
            </div>

            {pinError && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-2 text-sm text-red-700 dark:text-red-200">
                {pinError}
              </div>
            )}

            {pinSuccess && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-2 text-sm text-green-700 dark:text-green-200">
                PIN saved successfully!
              </div>
            )}

            <Button
              onClick={handleSavePin}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save PIN
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}