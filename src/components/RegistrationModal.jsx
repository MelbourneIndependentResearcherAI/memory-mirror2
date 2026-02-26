import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RegistrationModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    loved_one_name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.loved_one_name.trim() || !formData.email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        setError('Please log in to continue');
        return;
      }

      // Create user profile
      await base44.entities.UserProfile.create({
        loved_one_name: formData.loved_one_name,
        contact_email: formData.email,
        created_by: user.email
      });

      toast.success('Profile registered successfully!');
      setFormData({ loved_one_name: '', email: '' });
      onSuccess?.();
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to save profile. Please try again.');
      toast.error('Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Quick Registration</CardTitle>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Your Name
              </label>
              <Input
                type="text"
                name="loved_one_name"
                placeholder="Enter your name"
                value={formData.loved_one_name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              We'll use this information to help us serve you better and to contact you when needed.
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}