import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Share2, CheckCircle2, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);

  const appUrl = window.location.origin;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform) => {
    const message = `Check out Memory Mirror - an AI companion app for dementia care. It's been really helpful for our family. ${appUrl}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=Check out Memory Mirror&body=${encodeURIComponent(message)}`;
        break;
      default:
        copyToClipboard(appUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Share with Other Carers</h2>
        <p className="text-slate-600 dark:text-slate-400">Help other caregivers discover Memory Mirror</p>
      </div>

      {/* Share Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share Memory Mirror
          </CardTitle>
          <CardDescription>
            Spread the word to caregivers and families who could benefit from Memory Mirror's support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* App Link */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between gap-3 border border-slate-200 dark:border-slate-700">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">App Link</p>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate">{appUrl}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(appUrl)}
              className="flex-shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={() => shareVia('whatsapp')}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <span>💬</span>
              WhatsApp
            </Button>
            <Button
              onClick={() => shareVia('facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <span>f</span>
              Facebook
            </Button>
            <Button
              onClick={() => shareVia('email')}
              className="bg-slate-600 hover:bg-slate-700 text-white gap-2"
            >
              <span>✉</span>
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Why Share */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Why Share?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-slate-700 dark:text-slate-300">
            Many caregivers are unaware of tools like Memory Mirror that can help with dementia care. Your recommendation can make a real difference in someone's life.
          </p>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Help other families discover 24/7 AI companionship support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Reduce isolation for people living with dementia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Build community among caregivers</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}