import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Heart, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CaregiverSignup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    patientName: '',
    relationship: '',
    phoneNumber: '',
    acceptedTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.acceptedTerms) {
      toast.error('Please accept the Terms & Privacy Policy');
      return;
    }

    setIsLoading(true);
    
    // Store signup data for after authentication
    sessionStorage.setItem('pendingSignup', JSON.stringify({
      patientName: formData.patientName,
      relationship: formData.relationship,
      phoneNumber: formData.phoneNumber
    }));
    
    // Redirect to Base44 authentication
    base44.auth.redirectToLogin(createPageUrl('CaregiverPortal'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 p-6">
      <div className="max-w-2xl mx-auto">
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
            <CardTitle className="text-3xl md:text-4xl mb-3">Create Caregiver Account</CardTitle>
            <CardDescription className="text-base">
              Get full access to monitoring, insights, and controls
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  <Shield className="w-4 h-4" />
                  Account Information
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="caregiver@example.com"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Patient Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  <Heart className="w-4 h-4" />
                  Patient Information
                </div>

                <div>
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Who you're caring for"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="relationship">Your Relationship *</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse/Partner</SelectItem>
                      <SelectItem value="child">Adult Child</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="professional">Professional Caregiver</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">For emergency notifications</p>
                </div>
              </div>

              {/* Terms & Privacy */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={formData.acceptedTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptedTerms: checked })}
                  required
                />
                <label htmlFor="terms" className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer">
                  I accept the{' '}
                  <a href={createPageUrl('TermsOfService')} target="_blank" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href={createPageUrl('PrivacyPolicy')} target="_blank" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  . I understand that patient data is handled according to HIPAA/GDPR standards.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Caregiver Account'}
              </Button>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate(createPageUrl('CaregiverLogin'))}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}