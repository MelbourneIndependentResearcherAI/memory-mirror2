import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureLock } from '@/components/FeatureLockManager';
import { AlertTriangle, Lock, Unlock, Moon } from 'lucide-react';

/**
 * Control panel for Night Guard lock
 * Only carers can activate/deactivate this
 */
export default function NightGuardLockControl() {
  const { activateNightGuardLock, deactivateNightGuardLock, isNightGuardActive } = useFeatureLock();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinForDeactivate, setShowPinForDeactivate] = useState(false);

  const active = isNightGuardActive();

  const handleActivate = () => {
    setLoading(true);
    // Activate with Night Watch as primary lock, but allow no other screens
    activateNightGuardLock('NightWatch', ['main']);
    setLoading(false);
  };

  const handleDeactivate = async () => {
    if (!pin) {
      alert('Please enter PIN');
      return;
    }

    setLoading(true);
    const success = await deactivateNightGuardLock('NightWatch', pin);
    
    if (success) {
      setPin('');
      setShowPinForDeactivate(false);
      alert('Night Guard lock deactivated');
    } else {
      alert('Incorrect PIN');
    }
    
    setLoading(false);
  };

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <Moon className="w-5 h-5" />
          Night Guard Lock Control
        </CardTitle>
        <CardDescription>
          Activate to lock the patient in Night Watch mode. Only carers can deactivate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {active && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-semibold">Night Guard Lock is ACTIVE</p>
              <p className="text-xs mt-1">The patient cannot exit Night Watch mode without caregiver authorization.</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {!active ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Night Guard lock will restrict patient access to Night Watch mode only. They will not be able to exit without caregiver PIN.
              </p>
              <Button
                onClick={handleActivate}
                disabled={loading}
                className="w-full gap-2 bg-red-600 hover:bg-red-700"
              >
                <Lock className="w-4 h-4" />
                Activate Night Guard Lock
              </Button>
            </>
          ) : (
            <>
              {!showPinForDeactivate ? (
                <Button
                  onClick={() => setShowPinForDeactivate(true)}
                  variant="outline"
                  className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                >
                  <Unlock className="w-4 h-4" />
                  Deactivate Night Guard Lock
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter PIN to Deactivate</label>
                    <input
                      type="password"
                      maxLength="4"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="••••"
                      className="w-full text-center text-2xl font-bold tracking-widest border-2 border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:border-red-500 focus:outline-none bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPinForDeactivate(false);
                        setPin('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeactivate}
                      disabled={loading || pin.length !== 4}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {loading ? 'Verifying...' : 'Deactivate'}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}