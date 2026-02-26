import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Gift, CheckCircle2, Clock, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  // Fetch user's referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ['userReferrals', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ReferralProgram.filter({ referrer_email: user.email });
    },
    enabled: !!user?.email
  });

  const referralCode = user?.email ? `REF-${user.email.split('@')[0].toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : '';
  const referralUrl = `${window.location.origin}?ref=${referralCode}`;

  const stats = {
    total: referrals.length,
    completed: referrals.filter(r => r.status === 'completed').length,
    pending: referrals.filter(r => r.status === 'pending').length,
    rewardsClaimed: referrals.filter(r => r.reward_claimed).length
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Referral Program</h2>
        <p className="text-slate-600 dark:text-slate-400">Invite friends & family and earn rewards for every successful signup</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Successful Signups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.rewardsClaimed}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Rewards Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with friends & family. When they sign up and subscribe, you both get rewards!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between gap-3 border border-slate-200 dark:border-slate-700">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Your Referral Link</p>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate">{referralUrl}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(referralUrl)}
              className="flex-shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Referral Code</p>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{referralCode}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Your Email</p>
              <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{user.email}</p>
            </div>
          </div>

          <Button
            onClick={() => setShowInviteModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
          >
            <Users className="w-4 h-4" />
            Invite via Email
          </Button>
        </CardContent>
      </Card>

      {/* Rewards Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Share Your Link</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Send your referral link to friends, family, or caregivers</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">They Sign Up</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">They click your link and create an account</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">They Subscribe</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Once they subscribe, you both unlock rewards</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">4</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Claim Your Reward</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">$10 account credit or 1 month free extension</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((referral, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{referral.referee_email || 'Pending'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {referral.status === 'completed' ? 'Signed up • ' : ''}
                      {referral.referral_date ? new Date(referral.referral_date).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {referral.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {referral.status === 'pending' && (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {referral.reward_claimed && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        Reward Claimed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {referrals.length === 0 && (
        <Card className="text-center p-8">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No Referrals Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Start inviting people using your referral link above. When they sign up and subscribe, they'll appear here!
          </p>
          <Button
            onClick={() => copyToClipboard(referralUrl)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link & Share
          </Button>
        </Card>
      )}
    </div>
  );
}