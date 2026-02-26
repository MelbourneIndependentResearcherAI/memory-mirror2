import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

export default function PatientAccess() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  const handleInstantAccess = async () => {
    // Store user details if provided
    if (userEmail || userName) {
      try {
        localStorage.setItem('memory_mirror_user', JSON.stringify({
          email: userEmail,
          name: userName,
          registered_at: new Date().toISOString()
        }));
      } catch (error) {
        console.log('Local storage not available');
      }
    }

    // Track session
    try {
      await base44.functions.invoke('trackPatientSession', {
        access_method: 'instant',
        patient_name: userName || 'Guest User',
        user_email: userEmail
      });
    } catch (error) {
      console.log('Session tracking skipped:', error.message);
    }
    
    navigate('/ChatMode');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950 dark:via-cyan-950 dark:to-sky-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-6 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            How would you like to access Memory Mirror?
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Your Name (Optional)
                  </label>
                  <Input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Email Address (Optional)
                  </label>
                  <Input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-12 text-base"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This helps us personalize your experience. Not required for security.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleInstantAccess}
            className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700"
          >
            <User className="w-6 h-6 mr-3" />
            Start Chatting
          </Button>
        </div>
      </div>
    </div>
  );
}