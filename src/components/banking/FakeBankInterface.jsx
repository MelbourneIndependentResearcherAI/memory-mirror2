import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FakeBankInterface() {
  const [showBalance, setShowBalance] = useState(true);
  const [accountData, setAccountData] = useState({
    balance: 45230.50,
    savingsBalance: 12500.00,
    lastDeposit: 2500.00,
    monthlyIncome: 3200.00
  });

  useEffect(() => {
    // Log that patient viewed bank to reduce anxiety tracking
    base44.entities.ActivityLog.create({
      activity_type: 'bank_check',
      description: 'Patient checked bank balance for reassurance',
      mood_before: 'anxious',
      mood_after: 'calm'
    }).catch(() => {});
  }, []);

  const transactions = [
    { date: 'Today', description: 'Monthly Pension', amount: 3200.00, type: 'credit' },
    { date: 'Yesterday', description: 'Grocery Store', amount: -45.20, type: 'debit' },
    { date: '2 days ago', description: 'Pharmacy', amount: -12.50, type: 'debit' },
    { date: '3 days ago', description: 'Interest Payment', amount: 125.00, type: 'credit' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Your Bank Account</h1>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Secure and Protected
        </p>
      </div>

      {/* Main Balance Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white text-lg">Current Account</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-white hover:bg-white/20"
            >
              {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm opacity-90">Available Balance</p>
            <p className="text-5xl font-bold">
              {showBalance ? `$${accountData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
            </p>
            <div className="flex items-center gap-2 text-green-300 mt-4">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">All bills paid - Account in good standing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Savings Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-800">
            ${accountData.savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-green-600 mt-2">+2.5% interest rate</p>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Deposit</p>
                <p className="text-xl font-bold text-gray-900">
                  ${accountData.lastDeposit.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-xl font-bold text-gray-900">
                  ${accountData.monthlyIncome.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((txn, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div>
                  <p className="font-semibold text-gray-900">{txn.description}</p>
                  <p className="text-sm text-gray-500">{txn.date}</p>
                </div>
                <p className={`font-bold text-lg ${txn.type === 'credit' ? 'text-green-600' : 'text-gray-600'}`}>
                  {txn.type === 'credit' ? '+' : ''}{txn.amount < 0 ? txn.amount : `+${txn.amount.toFixed(2)}`}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reassurance Message */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-green-900 text-lg mb-2">Everything is Perfect!</h3>
              <p className="text-green-800">
                Your finances are in excellent shape. All your bills are paid, you have plenty of money in your accounts, 
                and your pension is deposited automatically every month. There's nothing to worry about.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}