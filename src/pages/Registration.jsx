import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, User, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Registration() {
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  // Fetch current user
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (name) => {
      return await base44.functions.invoke('registerUser', {
        full_name: name,
      });
    },
    onSuccess: () => {
      toast.success('Registration completed! Welcome aboard.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    },
    onError: () => {
      toast.error('Registration failed. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullName.trim()) {
      registerMutation.mutate(fullName.trim());
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate('/');
    }
  }, [userLoading, currentUser, navigate]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to Memory Mirror</CardTitle>
            <CardDescription>
              Complete your registration to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* User Info Display */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Registered Email</span>
              </div>
              <p className="font-medium text-slate-900">{currentUser?.email}</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={registerMutation.isPending}
                  className="text-base"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  This helps us personalize your experience
                </p>
              </div>

              <Button
                type="submit"
                disabled={!fullName.trim() || registerMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-auto"
                size="lg"
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block animate-spin">⌛</span>
                    Completing Registration...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Complete Registration
                  </span>
                )}
              </Button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700">
                ✓ Your information is encrypted and securely stored
              </p>
              <p className="text-sm text-slate-700 mt-2">
                ✓ Your email and name help us provide better care support
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}