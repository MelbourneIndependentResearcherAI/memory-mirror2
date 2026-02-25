import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Shield, AlertCircle } from 'lucide-react';

export default function UnlockModal({ isOpen, onUnlock, onCancel: _onCancel, modeName }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

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

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 p-3 bg-slate-50 rounded-lg">
            <Shield className="w-4 h-4" />
            <span>Default PIN: 1234. Change in Caregiver Portal settings.</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}