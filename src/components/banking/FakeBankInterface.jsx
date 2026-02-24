import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, CreditCard, Eye, EyeOff, ArrowUpCircle, ArrowDownCircle, RefreshCw, X, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FakeBankInterface({ onClose }) {
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBillPayModal, setShowBillPayModal] = useState(false);
  const [processingTransaction, setProcessingTransaction] = useState(null);
  const queryClient = useQueryClient();

  // Predefined recipients for transfers
  const recipients = [
    { id: 'family1', name: 'John Smith - Family', account: '****5678' },
    { id: 'family2', name: 'Sarah Johnson - Daughter', account: '****9012' },
    { id: 'friend1', name: 'Robert Brown - Friend', account: '****3456' },
    { id: 'savings', name: 'My Savings Account', account: '****7890' }
  ];

  // Predefined billers
  const billers = [
    { id: 'electricity', name: 'Energy Australia', icon: '⚡' },
    { id: 'gas', name: 'Gas Company', icon: '🔥' },
    { id: 'water', name: 'Water Corporation', icon: '💧' },
    { id: 'phone', name: 'Telstra', icon: '📱' },
    { id: 'internet', name: 'NBN Co', icon: '🌐' },
    { id: 'council', name: 'Council Rates', icon: '🏛️' }
  ];

  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '' });
  const [billPayForm, setBillPayForm] = useState({ biller: '', amount: '' });

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

  // Mutation to update bank settings with new transaction
  const updateBankMutation = useMutation({
    mutationFn: async ({ newTransaction, newBalance, newAvailableBalance }) => {
      const settingsId = settings[0]?.id;
      if (!settingsId) return;

      const updatedTransactions = [
        newTransaction,
        ...(currentSettings.recent_transactions || [])
      ].slice(0, 10);

      await base44.entities.BankAccountSettings.update(settingsId, {
        balance: newBalance,
        available_balance: newAvailableBalance,
        recent_transactions: updatedTransactions
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bankSettings']);
    }
  });

  const handleTransfer = async () => {
    const amount = parseFloat(transferForm.amount);
    if (!transferForm.recipient || !amount || amount <= 0) {
      toast.error('Please select a recipient and enter a valid amount');
      return;
    }

    if (amount > currentSettings.available_balance) {
      toast.error('Insufficient funds');
      return;
    }

    const recipient = recipients.find(r => r.id === transferForm.recipient);
    
    // Set processing state
    setProcessingTransaction({ type: 'transfer', status: 'pending' });
    
    // Simulate processing time
    setTimeout(async () => {
      setProcessingTransaction({ type: 'transfer', status: 'processing' });
      
      setTimeout(async () => {
        const newTransaction = {
          date: new Date().toISOString().split('T')[0],
          description: `Transfer to ${recipient.name}`,
          amount: amount,
          type: 'debit'
        };

        const newBalance = currentSettings.balance - amount;
        const newAvailableBalance = currentSettings.available_balance - amount;

        await updateBankMutation.mutateAsync({
          newTransaction,
          newBalance,
          newAvailableBalance
        });

        setProcessingTransaction({ type: 'transfer', status: 'completed' });
        toast.success('Transfer completed successfully!');
        
        setTimeout(() => {
          setShowTransferModal(false);
          setTransferForm({ recipient: '', amount: '' });
          setProcessingTransaction(null);
        }, 1500);
      }, 2000);
    }, 1000);
  };

  const handleBillPay = async () => {
    const amount = parseFloat(billPayForm.amount);
    if (!billPayForm.biller || !amount || amount <= 0) {
      toast.error('Please select a biller and enter a valid amount');
      return;
    }

    if (amount > currentSettings.available_balance) {
      toast.error('Insufficient funds');
      return;
    }

    const biller = billers.find(b => b.id === billPayForm.biller);
    
    setProcessingTransaction({ type: 'billpay', status: 'pending' });
    
    setTimeout(async () => {
      setProcessingTransaction({ type: 'billpay', status: 'processing' });
      
      setTimeout(async () => {
        const newTransaction = {
          date: new Date().toISOString().split('T')[0],
          description: `${biller.icon} ${biller.name}`,
          amount: amount,
          type: 'debit'
        };

        const newBalance = currentSettings.balance - amount;
        const newAvailableBalance = currentSettings.available_balance - amount;

        await updateBankMutation.mutateAsync({
          newTransaction,
          newBalance,
          newAvailableBalance
        });

        setProcessingTransaction({ type: 'billpay', status: 'completed' });
        toast.success('Bill payment completed successfully!');
        
        setTimeout(() => {
          setShowBillPayModal(false);
          setBillPayForm({ biller: '', amount: '' });
          setProcessingTransaction(null);
        }, 1500);
      }, 2000);
    }, 1000);
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
            onClick={() => setShowTransferModal(true)}
            className="h-24 bg-white/10 hover:bg-white/20 text-white border border-white/20 flex flex-col gap-2"
          >
            <ArrowUpCircle className="w-6 h-6" />
            <span>Send Money</span>
          </Button>
          <Button
            onClick={() => setShowBillPayModal(true)}
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

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Send Money</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferForm({ recipient: '', amount: '' });
                  setProcessingTransaction(null);
                }}
                className="min-h-[44px] min-w-[44px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {processingTransaction?.type === 'transfer' ? (
                <div className="text-center py-8 space-y-4">
                  {processingTransaction.status === 'pending' && (
                    <>
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-spin" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Initiating Transfer</p>
                        <Badge className="mt-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>
                      </div>
                    </>
                  )}
                  {processingTransaction.status === 'processing' && (
                    <>
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Processing Transfer</p>
                        <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Processing</Badge>
                      </div>
                    </>
                  )}
                  {processingTransaction.status === 'completed' && (
                    <>
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Transfer Complete!</p>
                        <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Recipient</label>
                    <Select value={transferForm.recipient} onValueChange={(val) => setTransferForm({ ...transferForm, recipient: val })}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Choose recipient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {recipients.map(recipient => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            <div>
                              <div className="font-medium">{recipient.name}</div>
                              <div className="text-xs text-slate-500">{recipient.account}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Available Balance: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(currentSettings.available_balance)}</span>
                    </p>
                  </div>
                  <Button
                    onClick={handleTransfer}
                    className="w-full bg-blue-600 hover:bg-blue-700 min-h-[44px]"
                    disabled={!transferForm.recipient || !transferForm.amount || parseFloat(transferForm.amount) <= 0}
                  >
                    Send {transferForm.amount ? formatCurrency(parseFloat(transferForm.amount)) : ''}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bill Pay Modal */}
      {showBillPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pay Bills</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowBillPayModal(false);
                  setBillPayForm({ biller: '', amount: '' });
                  setProcessingTransaction(null);
                }}
                className="min-h-[44px] min-w-[44px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {processingTransaction?.type === 'billpay' ? (
                <div className="text-center py-8 space-y-4">
                  {processingTransaction.status === 'pending' && (
                    <>
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-spin" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Initiating Payment</p>
                        <Badge className="mt-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>
                      </div>
                    </>
                  )}
                  {processingTransaction.status === 'processing' && (
                    <>
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Processing Payment</p>
                        <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Processing</Badge>
                      </div>
                    </>
                  )}
                  {processingTransaction.status === 'completed' && (
                    <>
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Payment Complete!</p>
                        <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Biller</label>
                    <Select value={billPayForm.biller} onValueChange={(val) => setBillPayForm({ ...billPayForm, biller: val })}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Choose biller..." />
                      </SelectTrigger>
                      <SelectContent>
                        {billers.map(biller => (
                          <SelectItem key={biller.id} value={biller.id}>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{biller.icon}</span>
                              <span>{biller.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={billPayForm.amount}
                      onChange={(e) => setBillPayForm({ ...billPayForm, amount: e.target.value })}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Available Balance: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(currentSettings.available_balance)}</span>
                    </p>
                  </div>
                  <Button
                    onClick={handleBillPay}
                    className="w-full bg-blue-600 hover:bg-blue-700 min-h-[44px]"
                    disabled={!billPayForm.biller || !billPayForm.amount || parseFloat(billPayForm.amount) <= 0}
                  >
                    Pay {billPayForm.amount ? formatCurrency(parseFloat(billPayForm.amount)) : ''}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}