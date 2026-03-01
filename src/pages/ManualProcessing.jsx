import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Copy, CheckCircle2, DollarSign, User, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ManualProcessing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [manualTransaction, setManualTransaction] = useState({
    sender_name: '',
    amount: '',
    reference: '',
    notes: ''
  });

  // Banking details
  const bankDetails = {
    bsb: '633123',
    account: '166572719',
    payid: 'mcnamaram86@gmail.com',
    account_name: 'Memory Mirror Operations'
  };

  // Fetch manual processing records
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['manualProcessing'],
    queryFn: async () => {
      try {
        const records = await base44.entities.ManualTransaction.list('-created_date', 50);
        return records;
      } catch {
        return [];
      }
    }
  });

  // Create manual transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData) => {
      return await base44.entities.ManualTransaction.create(transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['manualProcessing']);
      toast.success('Transaction recorded successfully!');
      setManualTransaction({ sender_name: '', amount: '', reference: '', notes: '' });
      setProcessing(false);
    },
    onError: () => {
      toast.error('Failed to record transaction');
      setProcessing(false);
    }
  });

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmitTransaction = async () => {
    if (!manualTransaction.sender_name || !manualTransaction.amount) {
      toast.error('Please fill in sender name and amount');
      return;
    }

    const amount = parseFloat(manualTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);

    const transactionData = {
      sender_name: manualTransaction.sender_name,
      amount: amount,
      reference: manualTransaction.reference || 'No reference',
      notes: manualTransaction.notes || '',
      status: 'pending',
      transaction_date: new Date().toISOString(),
      bsb: bankDetails.bsb,
      account_number: bankDetails.account,
      payid: bankDetails.payid
    };

    createTransactionMutation.mutate(transactionData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Manual Payment Processing
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Record and manage manual bank transactions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Banking Details Card */}
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Account Details</CardTitle>
              <CardDescription className="text-blue-100">
                Use these details to receive payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-100">BSB</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.bsb, 'BSB')}
                    className="text-white hover:bg-white/20 h-8"
                  >
                    {copied === 'BSB' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-2xl font-bold tracking-wider">{bankDetails.bsb}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-100">Account Number</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.account, 'Account')}
                    className="text-white hover:bg-white/20 h-8"
                  >
                    {copied === 'Account' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-2xl font-bold tracking-wider">{bankDetails.account}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-100">PayID</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.payid, 'PayID')}
                    className="text-white hover:bg-white/20 h-8"
                  >
                    {copied === 'PayID' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xl font-bold">{bankDetails.payid}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-blue-100 mb-1">Account Name</p>
                <p className="font-semibold">{bankDetails.account_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Record Transaction Card */}
          <Card>
            <CardHeader>
              <CardTitle>Record New Transaction</CardTitle>
              <CardDescription>
                Manually log incoming payments received to the account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Sender Name *
                </label>
                <Input
                  placeholder="John Smith"
                  value={manualTransaction.sender_name}
                  onChange={(e) => setManualTransaction({ ...manualTransaction, sender_name: e.target.value })}
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Amount (AUD) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  value={manualTransaction.amount}
                  onChange={(e) => setManualTransaction({ ...manualTransaction, amount: e.target.value })}
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Payment Reference
                </label>
                <Input
                  placeholder="e.g., Invoice #1234"
                  value={manualTransaction.reference}
                  onChange={(e) => setManualTransaction({ ...manualTransaction, reference: e.target.value })}
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  placeholder="Additional details about this transaction..."
                  value={manualTransaction.notes}
                  onChange={(e) => setManualTransaction({ ...manualTransaction, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmitTransaction}
                className="w-full bg-blue-600 hover:bg-blue-700 min-h-[48px]"
                disabled={processing || !manualTransaction.sender_name || !manualTransaction.amount}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Transaction'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              All manually recorded transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-slate-500 mt-2">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No transactions recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {transaction.sender_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(transaction.created_date)}
                          </p>
                        </div>
                      </div>
                      <div className="ml-13 space-y-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Reference: <span className="font-medium">{transaction.reference}</span>
                        </p>
                        {transaction.notes && (
                          <p className="text-sm text-slate-500 dark:text-slate-500 italic">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}