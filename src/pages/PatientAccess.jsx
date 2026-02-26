import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function PatientAccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated, redirect to Home
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          navigate('/Home');
        }
      } catch (error) {
        console.log('Auth check:', error.message);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignUp = () => {
    // Redirect to sign up/login, then return to Home after successful auth
    base44.auth.redirectToLogin('/Home');
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
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Caregiver Access Required
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-2">
            Please register or log in to continue
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            This ensures secure access and personalized care for your loved one
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-blue-600 dark:text-blue-400">
                  <User className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Secure Registration Required
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  To protect your loved one's privacy and provide personalized care, please create an account or sign in.
                </p>
                <div className="pt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 text-left">
                  <p>✓ Secure data encryption</p>
                  <p>✓ Personalized care settings</p>
                  <p>✓ Family caregiver access</p>
                  <p>✓ Care journal and insights</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSignUp}
            className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <User className="w-6 h-6 mr-3" />
            Sign Up / Log In
          </Button>
          
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4 px-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}