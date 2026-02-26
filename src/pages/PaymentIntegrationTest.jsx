import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function PaymentIntegrationTest() {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState(null);

  // Verify payment integration
  const verifyMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('verifyPaymentIntegration', {});
    },
    onSuccess: (response) => {
      setTestResults(response.data);
      if (response.data.success) {
        toast.success('All payment systems verified! ✓');
      } else {
        toast.warning('Some systems need attention');
      }
    },
    onError: () => {
      toast.error('Verification failed');
    },
  });

  const getStatusIcon = (status) => {
    if (status === true) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (status) => {
    return status === true 
      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
      : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Payment Integration Verification
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Test and verify all payment systems are operational
          </p>
        </div>

        {/* Primary Test Button */}
        <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Run Full System Verification
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Verify all payment systems are properly integrated and operational
                </p>
              </div>
              <Button
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 min-h-[48px] whitespace-nowrap"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  'Start Verification'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {testResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Status */}
            <Card className={testResults.success ? 'border-green-200 dark:border-green-800' : 'border-yellow-200 dark:border-yellow-800'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Overall Status</CardTitle>
                  <Badge className={testResults.success ? 'bg-green-600' : 'bg-yellow-600'}>
                    {testResults.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="font-medium">Payment Email Linked</span>
                    <code className="text-sm bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded">
                      {testResults.integration_status.payment_email_linked}
                    </code>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    ✓ Verification completed at {new Date(testResults.verification.timestamp).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Verification */}
            <Card>
              <CardHeader>
                <CardTitle>System Components Verified</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(testResults.systems_verified).map(([system, status]) => (
                  <motion.div
                    key={system}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <span className="capitalize font-medium text-slate-900 dark:text-white">
                        {system.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Badge className={status ? 'bg-green-600' : 'bg-red-600'}>
                      {status ? 'ACTIVE' : 'ERROR'}
                    </Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Integration Details */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(testResults.integration_status).map(([key, value]) => (
                    <div key={key} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase mb-1">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Data Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {testResults.subscription_count || 0}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Subscriptions</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {testResults.transaction_count || 0}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Transactions</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {testResults.audit_log_count || 0}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Audit Logs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Log */}
            {testResults.error_log && testResults.error_log.length > 0 && (
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    Errors Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {testResults.error_log.map((error, idx) => (
                      <li key={idx} className="text-sm text-red-700 dark:text-red-300">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Success Banner */}
            {testResults.success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-900 dark:text-green-400">
                      ✓ All Payment Systems Operational
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                      Payment processing is fully integrated and ready for user subscriptions.
                      Email mcnamaram86@gmail.com is configured as the payment recipient.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}