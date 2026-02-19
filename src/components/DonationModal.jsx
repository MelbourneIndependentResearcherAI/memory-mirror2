import React, { useState } from 'react';
import { X, Copy, Check, CreditCard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function DonationModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const bankDetails = {
    bsb: '633-123',
    account: '166572719',
    name: 'M. McNamara'
  };

  const copyBankDetails = () => {
    const text = `BSB: ${bankDetails.bsb}\nAccount: ${bankDetails.account}\nName: ${bankDetails.name}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        toast.success('Bank details copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {
        alert(`Bank Transfer Details:\n\n${text}`);
      });
    } else {
      alert(`Bank Transfer Details:\n\n${text}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <Card className="max-w-2xl w-full bg-white dark:bg-slate-900 p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💙</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Support Memory Mirror
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Your donations keep Memory Mirror free and accessible for families caring for loved ones with dementia. 
            100% of funds go toward server costs and AI services—never personal use.
          </p>
        </div>

        {/* Donation Methods */}
        <div className="space-y-4 mb-6">
          {/* PayPal Option */}
          <div 
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              selectedMethod === 'paypal' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800'
            }`}
            onClick={() => setSelectedMethod('paypal')}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  PayPal Donation
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Secure, instant, accepts cards & PayPal balance
                </p>
              </div>
              {selectedMethod === 'paypal' && (
                <Check className="w-6 h-6 text-green-600" />
              )}
            </div>
            
            {selectedMethod === 'paypal' && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
                  onClick={() => window.open('https://www.paypal.com/donate', '_blank')}
                >
                  Donate with PayPal →
                </Button>
              </div>
            )}
          </div>

          {/* Bank Transfer Option */}
          <div 
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              selectedMethod === 'bank' 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800'
            }`}
            onClick={() => setSelectedMethod('bank')}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Direct Bank Transfer
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  For Australian bank accounts (no fees)
                </p>
              </div>
              {selectedMethod === 'bank' && (
                <Check className="w-6 h-6 text-green-600" />
              )}
            </div>
            
            {selectedMethod === 'bank' && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">BSB:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{bankDetails.bsb}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Account:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{bankDetails.account}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{bankDetails.name}</span>
                  </div>
                </div>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold"
                  onClick={copyBankDetails}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Bank Details
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Impact Message */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-center">
            <strong className="text-amber-900 dark:text-amber-400">🙏 Thank you for your support!</strong>
            <br />
            Every dollar helps keep Memory Mirror running for families who need it most.
            Your generosity makes compassionate dementia care accessible to all.
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Memory Mirror is a non-profit initiative. All donations are used exclusively for operational costs.
          </p>
        </div>
      </Card>
    </div>
  );
}