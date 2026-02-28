import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Shield, AlertCircle, KeyRound } from 'lucide-react';
import { useLockMode } from '@/components/LockModeManager';

export default function UnlockModal({ isOpen, onUnlock, onCancel: _onCancel, modeName }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showChangePinMode, setShowChangePinMode] = useState(false);
  const [pinChanged, setPinChanged] = useState(false);
  const { isDefaultPin, updateCaregiverPin } = useLockMode();

  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    if (newPin.length === 4) {
      updateCaregiverPin(newPin);
      setPinChanged(true);
      setShowChangePinMode(false);
      setNewPin('');
      setTimeout(() => setPinChanged(false), 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onUnlock(pin);
    if (success) {
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="w-6 h-6 text-amber-600" />
            Caregiver Unlock Required
          </DialogTitle>
          <DialogDescription>
            {modeName} is locked. Please enter the caregiver PIN to unlock.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > i
                    ? error
                      ? 'bg-red-500 border-red-500'
                      : 'bg-blue-500 border-blue-500'
                    : 'border-slate-300'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Incorrect PIN. Please try again.</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num.toString())}
                className="h-16 text-2xl font-bold"
                variant="outline"
              >
                {num}
              </Button>
            ))}
            <Button
              type="button"
              onClick={handleClear}
              className="h-16 text-lg font-semibold"
              variant="outline"
            >
              Clear
            </Button>
            <Button
              type="button"
              onClick={() => handleNumberClick('0')}
              className="h-16 text-2xl font-bold"
              variant="outline"
            >
              0
            </Button>
            <Button
              type="submit"
              disabled={pin.length !== 4}
              className="h-16 text-lg font-semibold bg-green-600 hover:bg-green-700"
            >
              Unlock
            </Button>
          </div>

          {isDefaultPin && !showChangePinMode && (
            <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">You're using the default PIN (1234)</p>
                <button onClick={() => setShowChangePinMode(true)} className="underline text-amber-600 dark:text-amber-400 mt-0.5">
                  Tap here to change it now
                </button>
              </div>
            </div>
          )}

          {showChangePinMode && (
            <form onSubmit={handleChangePinSubmit} className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Set new 4-digit PIN
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').substring(0,4))}
                  className="flex-1 border-2 border-blue-300 rounded-lg px-3 py-2 text-center text-lg font-bold tracking-widest"
                  placeholder="____"
                />
                <Button type="submit" disabled={newPin.length !== 4} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Save
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => { setShowChangePinMode(false); setNewPin(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {pinChanged && (
            <div className="flex items-center gap-2 text-xs text-green-700 mt-2 p-3 bg-green-50 rounded-lg">
              <Shield className="w-4 h-4" />
              <span>PIN updated successfully!</span>
            </div>
          )}

          {!isDefaultPin && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 p-3 bg-slate-50 rounded-lg">
              <Shield className="w-4 h-4" />
              <span>PIN is set. Change in Caregiver Portal settings.</span>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}