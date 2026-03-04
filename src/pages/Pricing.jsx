import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Copy, CheckCircle2, ArrowLeft, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const bankDetails = [
  { label: 'BSB', value: '633123' },
  { label: 'Account Number', value: '166572719' },
  { label: 'Account Name', value: 'Memory Mirror Operations' },
  { label: 'PayID', value: 'mickiimac@up.me' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Support Memory Mirror</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Memory Mirror is <strong>completely free</strong> to use — always.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            If it's helped your family, a donation helps keep this project alive and growing.
          </p>
        </div>

        {/* Free badge */}
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-center mb-6">
          <p className="text-green-800 dark:text-green-400 font-semibold text-sm">
            🆓 No subscriptions. No paywalls. No credit card. Free forever.
          </p>
        </div>

        {/* Bank Transfer Donation */}
        <Card className="shadow-xl border-0 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Building2 className="w-5 h-5 text-blue-600" />
              Donate via Bank Transfer
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Any amount is gratefully appreciated — even $5 makes a difference.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {bankDetails.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
              >
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(value, label)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  {copied === label
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            ))}

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-400">
              💡 Include your name or "Memory Mirror donation" in the payment reference so we know who to thank!
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Donations are voluntary and go directly to maintaining and improving Memory Mirror.
          You will not receive any additional features for donating — the app is already fully free.
        </p>
      </div>
    </div>
  );
}