import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, AlertTriangle } from 'lucide-react';

export default function FeatureLockModal({ isOpen, onClose, onUnlock, featureName, isNightGuard = false }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinDots, setPinDots] = useState('');

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    setPinDots('●'.repeat(value.length));
    setError('');
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    const success = await onUnlock(pin);
    
    if (!success) {
      setError('Incorrect PIN');
      setPin('');
      setPinDots('');
    } else {
      setPin('');
      setPinDots('');
      onClose();
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className={`w-5 h-5 ${isNightGuard ? 'text-red-500' : 'text-purple-500'}`} />
            <DialogTitle>
              {isNightGuard ? 'Night Guard Lock' : `${featureName} Locked`}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isNightGuard 
              ? 'This feature is locked for Night Guard mode. Only carers can deactivate it. Enter caregiver PIN to unlock.' 
              : 'This feature is locked. Enter caregiver PIN to unlock.'}
          </DialogDescription>
        </DialogHeader>

        {isNightGuard && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">
              Night Guard mode is active. The patient cannot exit this mode without caregiver authorization.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Caregiver PIN</label>
            <div className="relative">
              <input
                type="text"
                maxLength="4"
                value={pin}
                onChange={handlePinChange}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="w-full text-center text-2xl font-bold tracking-widest border-2 border-slate-300 rounded-lg p-3 focus:border-purple-500 focus:outline-none"
                autoFocus
              />
              {pin && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-600">
                  {pinDots}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-2 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleSubmit}
              disabled={loading || pin.length !== 4}
            >
              {loading ? 'Unlocking...' : 'Unlock'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}