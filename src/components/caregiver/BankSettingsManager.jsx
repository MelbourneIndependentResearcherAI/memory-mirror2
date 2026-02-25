import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Plus, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function BankSettingsManager({ onBack }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    account_name: 'Savings Account',
    account_number: '****1234',
    balance: 5000,
    available_balance: 4500,
    show_recent_transactions: true,
    enable_transfers: false,
    is_active: true
  });
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'debit'
  });

  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['bankSettings'],
    queryFn: () => base44.entities.BankAccountSettings.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BankAccountSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankSettings'] });
      setShowForm(false);
      toast.success('Bank account settings created');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BankAccountSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankSettings'] });
      toast.success('Settings updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BankAccountSettings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankSettings'] });
      toast.success('Settings deleted');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addTransaction = (settingId, currentTransactions = []) => {
    if (!newTransaction.description || newTransaction.amount === 0) {
      toast.error('Please fill in transaction details');
      return;
    }

    const updatedTransactions = [
      newTransaction,
      ...currentTransactions
    ].slice(0, 10); // Keep only last 10

    updateMutation.mutate({
      id: settingId,
      data: { recent_transactions: updatedTransactions }
    });

    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'debit'
    });
  };

  const currentSettings = settings[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-blue-600" />
            Fake Banking Settings
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configure fake bank account for patient reassurance
          </p>
        </div>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
        )}
      </div>

      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-slate-700 dark:text-slate-300">
          <strong>Purpose:</strong> This fake banking interface helps dementia patients feel secure about their finances.
          Caregivers can customize account balances and transaction history to suit the patient's needs.
        </AlertDescription>
      </Alert>

      {!currentSettings && !showForm && (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <CreditCard className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
              No bank account configured
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Create a fake bank account to help ease patient concerns
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Fake Account
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Fake Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={formData.account_name}
                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                    placeholder="Savings Account"
                  />
                </div>
                <div>
                  <Label htmlFor="account_number">Account Number (Masked)</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                    placeholder="****1234"
                  />
                </div>
                <div>
                  <Label htmlFor="balance">Current Balance ($)</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value)})}
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="available_balance">Available Balance ($)</Label>
                  <Input
                    id="available_balance"
                    type="number"
                    value={formData.available_balance}
                    onChange={(e) => setFormData({...formData, available_balance: parseFloat(e.target.value)})}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.show_recent_transactions}
                    onCheckedChange={(checked) => setFormData({...formData, show_recent_transactions: checked})}
                  />
                  <Label>Show Transactions</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.enable_transfers}
                    onCheckedChange={(checked) => setFormData({...formData, enable_transfers: checked})}
                  />
                  <Label>Enable Transfers</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Account
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentSettings && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Account Name</Label>
                  <p className="text-lg font-semibold">{currentSettings.account_name}</p>
                </div>
                <div>
                  <Label>Account Number</Label>
                  <p className="text-lg font-semibold">{currentSettings.account_number}</p>
                </div>
                <div>
                  <Label>Current Balance</Label>
                  <Input
                    type="number"
                    value={currentSettings.balance}
                    onChange={(e) => updateMutation.mutate({
                      id: currentSettings.id,
                      data: { balance: parseFloat(e.target.value) }
                    })}
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Available Balance</Label>
                  <Input
                    type="number"
                    value={currentSettings.available_balance}
                    onChange={(e) => updateMutation.mutate({
                      id: currentSettings.id,
                      data: { available_balance: parseFloat(e.target.value) }
                    })}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currentSettings.is_active}
                    onCheckedChange={(checked) => updateMutation.mutate({
                      id: currentSettings.id,
                      data: { is_active: checked }
                    })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <Button
                onClick={() => deleteMutation.mutate(currentSettings.id)}
                variant="destructive"
                size="sm"
              >
                Delete Settings
              </Button>
            </CardContent>
          </Card>

          {/* Transaction Manager */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
                <Input
                  placeholder="Description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                  step="0.01"
                />
                <div className="flex gap-2">
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="debit">Debit (-)</option>
                    <option value="credit">Credit (+)</option>
                  </select>
                  <Button
                    onClick={() => addTransaction(currentSettings.id, currentSettings.recent_transactions)}
                    size="sm"
                    className="min-w-[44px]"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {currentSettings.recent_transactions?.length > 0 && (
                <div className="space-y-2">
                  <Label>Recent Transactions</Label>
                  {currentSettings.recent_transactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                      <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}