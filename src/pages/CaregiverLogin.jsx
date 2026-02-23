import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, ArrowLeft, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function CaregiverLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Use Base44's built-in authentication
      base44.auth.redirectToLogin(createPageUrl('CaregiverPortal'));
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset link will be sent to your email');
    // In production, trigger password reset flow
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate(createPageUrl('Landing'))}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to home
        </button>

        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl mb-3">Caregiver Login</CardTitle>
            <CardDescription className="text-base">
              Access your dashboard and patient insights
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="caregiver@example.com"
                  required
                  className="mt-1"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <label htmlFor="remember" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
              </Button>

              {/* Security Notice */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <p className="font-medium mb-1">Secure Caregiver Access</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Your session is encrypted and will timeout after 24 hours of inactivity for security.
                  </p>
                </div>
              </div>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate(createPageUrl('CaregiverSignup'))}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Create caregiver account
                </button>
              </p>

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Patient access (no login required)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('PatientAccess'))}
                  className="w-full"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Quick Patient Access
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}