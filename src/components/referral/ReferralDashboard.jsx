import React, { useState } from 'react';
import { Copy, Share2, CheckCircle2 } from 'lucide-react';
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
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
      <Share2 className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
      <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">Share Memory Mirror</span>
      <button
        onClick={() => shareVia('whatsapp')}
        title="Share via WhatsApp"
        className="text-lg leading-none hover:scale-110 transition-transform"
      >💬</button>
      <button
        onClick={() => shareVia('facebook')}
        title="Share via Facebook"
        className="text-lg leading-none hover:scale-110 transition-transform"
      >📘</button>
      <button
        onClick={() => shareVia('email')}
        title="Share via Email"
        className="text-lg leading-none hover:scale-110 transition-transform"
      >✉️</button>
      <button
        onClick={() => copyToClipboard(appUrl)}
        title="Copy link"
        className="ml-1 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
      </button>
    </div>
  );
}