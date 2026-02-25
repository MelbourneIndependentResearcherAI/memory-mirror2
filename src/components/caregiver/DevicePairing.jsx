import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, QrCode, Key, CheckCircle, Wifi } from 'lucide-react';
import { toast } from 'sonner';

export default function DevicePairing() {
  const [pairingMethod, setPairingMethod] = useState(null);
  const [pairingCode, setPairingCode] = useState('');
  const [isPaired, setIsPaired] = useState(false);
  const queryClient = useQueryClient();

  // Generate random 6-digit pairing code
  const generatePairingCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const [generatedCode] = useState(generatePairingCode());

  const pairDeviceMutation = useMutation({
    mutationFn: async (code) => {
      // In production, verify code and link device to caregiver account
      return { success: true, deviceId: `device-${Date.now()}` };
    },
    onSuccess: () => {
      setIsPaired(true);
      toast.success('Device paired successfully!');
      queryClient.invalidateQueries({ queryKey: ['pairedDevices'] });
    },
    onError: () => {
      toast.error('Pairing failed. Please try again.');
    }
  });

  const handleCodePairing = (e) => {
    e.preventDefault();
    if (pairingCode.length === 6) {
      pairDeviceMutation.mutate(pairingCode);
    } else {
      toast.error('Please enter a 6-digit code');
    }
  };

  if (isPaired) {
    return (
      <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Device Paired Successfully!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You can now monitor patient activity and receive notifications
            </p>
            <Button variant="outline" onClick={() => setIsPaired(false)}>
              Pair Another Device
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pairingMethod) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link Patient Device</CardTitle>
          <CardDescription>
            Connect the patient's device to your caregiver account for monitoring and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <Wifi className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-slate-700 dark:text-slate-300">
              Device pairing allows you to monitor activity, receive alerts, and configure settings remotely.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setPairingMethod('qr')}
              className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl transition-all text-left group"
            >
              <QrCode className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">QR Code</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Scan with patient device camera
              </p>
            </button>

            <button
              onClick={() => setPairingMethod('code')}
              className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 rounded-xl transition-all text-left group"
            >
              <Key className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">6-Digit Code</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enter code from patient device
              </p>
            </button>

            <button
              onClick={() => {
                pairDeviceMutation.mutate('same-device');
              }}
              className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600 rounded-xl transition-all text-left group"
            >
              <Smartphone className="w-10 h-10 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Same Device</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Patient uses this device
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pairingMethod === 'qr') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Open the patient device and scan this code to pair
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center p-8 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <div className="text-center">
              <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-32 h-32 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">QR Code would appear here</p>
              <p className="text-xs text-slate-400 mt-2">Code: {generatedCode}</p>
            </div>
          </div>

          <Alert>
            <Smartphone className="w-4 h-4" />
            <AlertDescription>
              <strong>Instructions:</strong> Open Memory Mirror on the patient's device → Settings → Pair Device → Scan QR Code
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPairingMethod(null)} className="flex-1">
              Back
            </Button>
            <Button onClick={() => setPairingMethod('code')} className="flex-1">
              Use Code Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pairingMethod === 'code') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Pairing Code</CardTitle>
          <CardDescription>
            Enter the 6-digit code displayed on the patient device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCodePairing} className="space-y-6">
            <div>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-3xl tracking-widest font-bold h-16"
                autoFocus
              />
              <p className="text-center text-sm text-slate-500 mt-3">
                Find this code in: Patient Device → Settings → Device Pairing
              </p>
            </div>

            <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <Key className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-slate-700 dark:text-slate-300">
                <strong>Demo Code:</strong> {generatedCode} (for testing purposes)
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPairingMethod(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={pairingCode.length !== 6 || pairDeviceMutation.isLoading}
                className="flex-1"
              >
                {pairDeviceMutation.isLoading ? 'Pairing...' : 'Pair Device'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return null;
}