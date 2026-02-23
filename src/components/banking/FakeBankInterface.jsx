import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CreditCard, Eye, EyeOff, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function FakeBankInterface({ onClose }) {
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['bankSettings'],
    queryFn: async () => {
      const allSettings = await base44.entities.BankAccountSettings.list();
      return allSettings.filter(s => s.is_active);
    }
  });

  const currentSettings = settings[0] || {
    account_name: 'Savings Account',
    account_number: '****1234',
    balance: 5000,
    available_balance: 4500,
    show_recent_transactions: true,
    recent_transactions: [
      { date: '2026-02-20', description: 'Grocery Store', amount: -85.50, type: 'debit' },
      { date: '2026-02-18', description: 'Pension Payment', amount: 1200.00, type: 'credit' },
      { date: '2026-02-15', description: 'Pharmacy', amount: -32.75, type: 'debit' }
    ]
  };

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Track patient session
    const sessionData = sessionStorage.getItem('patientSession');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.patientId) {
          base44.functions.invoke('trackPatientSession', {
            patient_id: session.patientId,
            session_type: 'bank_interaction'
          }).catch(() => {});
        }
      } catch {}
    }
    
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Account updated');
    }, 1000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading your account...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8" />
            My Bank
          </h1>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 min-h-[44px] min-w-[44px]"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Account Balance Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-0 text-white mb-6 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">{currentSettings.account_name}</p>
                <p className="text-blue-200 text-xs">{currentSettings.account_number}</p>
              </div>
              <Button
                onClick={() => setShowBalance(!showBalance)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 min-h-[44px] min-w-[44px]"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-blue-100 mb-1">Current Balance</p>
              <p className="text-4xl font-bold">
                {showBalance ? formatCurrency(currentSettings.balance) : '••••••'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-100 mb-1">Available</p>
                <p className="text-lg font-semibold">
                  {showBalance ? formatCurrency(currentSettings.available_balance) : '••••••'}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-100 mb-1">On Hold</p>
                <p className="text-lg font-semibold">
                  {showBalance ? formatCurrency(currentSettings.balance - currentSettings.available_balance) : '••••••'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => toast.info('Transfer feature coming soon')}
            className="h-24 bg-white/10 hover:bg-white/20 text-white border border-white/20 flex flex-col gap-2"
            disabled={!currentSettings.enable_transfers}
          >
            <ArrowUpCircle className="w-6 h-6" />
            <span>Send Money</span>
          </Button>
          <Button
            onClick={() => toast.info('Payment feature coming soon')}
            className="h-24 bg-white/10 hover:bg-white/20 text-white border border-white/20 flex flex-col gap-2"
          >
            <ArrowDownCircle className="w-6 h-6" />
            <span>Pay Bills</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        {currentSettings.show_recent_transactions && currentSettings.recent_transactions?.length > 0 && (
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentSettings.recent_transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' 
                        ? 'bg-green-100 dark:bg-green-950' 
                        : 'bg-red-100 dark:bg-red-950'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'credit' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <div className="mt-6 bg-blue-900/50 border border-blue-400/30 rounded-lg p-4">
          <p className="text-blue-100 text-sm text-center">
            🔒 Your account is secure and protected
          </p>
        </div>

        {/* Close Button */}
        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white border-white/30 min-h-[44px]"
          >
            Close Banking
          </Button>
        )}
      </div>
    </div>
  );
}