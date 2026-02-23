import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tv, CheckCircle2, Wifi, MonitorPlay, ArrowRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

export default function TVPairing() {
  const [step, setStep] = useState(1);
  const [pairingCode, setPairingCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isPaired, setIsPaired] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: connections = [] } = useQuery({
    queryKey: ['tvConnections'],
    queryFn: () => base44.entities.TVConnection.list()
  });

  const createConnectionMutation = useMutation({
    mutationFn: (data) => base44.entities.TVConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tvConnections'] });
      setIsPaired(true);
      toast.success('TV paired successfully!');
      setTimeout(() => navigate('/TVMode'), 2000);
    }
  });

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPairingCode(code);
    setStep(2);
  };

  const handlePair = () => {
    if (!deviceName.trim()) {
      toast.error('Please enter a device name');
      return;
    }

    createConnectionMutation.mutate({
      pairing_code: pairingCode,
      device_name: deviceName,
      is_active: true,
      last_connected: new Date().toISOString(),
      tv_settings: {
        text_size: 'extra-large',
        voice_enabled: true,
        auto_scroll: true
      }
    });
  };

  const activeConnections = connections.filter(c => c.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Tv className="w-20 h-20 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Smart TV Mode
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Use Memory Mirror on your big screen television
          </p>
        </div>

        {!isPaired && (
          <>
            {step === 1 && (
              <Card className="border-2 border-indigo-200 dark:border-indigo-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Wifi className="w-6 h-6 text-indigo-600" />
                    Connect Your TV
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                    <Info className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-slate-700 dark:text-slate-300">
                      <strong>How it works:</strong>
                      <ol className="mt-2 ml-4 space-y-1 list-decimal text-sm">
                        <li>Open Memory Mirror on your TV's web browser</li>
                        <li>Generate a pairing code on this device</li>
                        <li>Enter the code on your TV</li>
                        <li>Enjoy large-text, voice-enabled experience</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <MonitorPlay className="w-5 h-5" />
                      TV Features
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Extra-large text for easy reading
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Voice-controlled interface
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Auto-scroll for comfortable viewing
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Full-screen photo galleries
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Music therapy sessions
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={generateCode}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-6"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Generate Pairing Code
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && !isPaired && (
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-2xl">Enter Pairing Code on TV</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-12 text-center">
                    <p className="text-white/80 text-sm mb-4">Your Pairing Code:</p>
                    <div className="text-7xl md:text-8xl font-bold text-white tracking-widest">
                      {pairingCode}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="deviceName">TV Name (Optional)</Label>
                      <Input
                        id="deviceName"
                        placeholder="Living Room TV"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handlePair}
                      className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Complete Pairing
                    </Button>

                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {isPaired && (
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="w-24 h-24 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                TV Connected!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                You can now use Memory Mirror on your television
              </p>
              <Button
                onClick={() => navigate('/TVMode')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Open TV Mode
              </Button>
            </CardContent>
          </Card>
        )}

        {activeConnections.length > 0 && !isPaired && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Connected TVs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Tv className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="font-semibold">{connection.device_name || 'TV Device'}</p>
                        <p className="text-sm text-slate-500">
                          Code: {connection.pairing_code}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate('/TVMode')}
                      variant="outline"
                      size="sm"
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}