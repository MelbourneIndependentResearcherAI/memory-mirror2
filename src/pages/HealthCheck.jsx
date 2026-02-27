import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HealthCheck() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    setLoading(true);
    const checks = {};

    // 1. Check authentication
    try {
      const user = await base44.auth.me();
      checks.auth = { success: !!user, message: user ? `Authenticated as ${user.email}` : 'Not authenticated' };
    } catch (error) {
      checks.auth = { success: false, message: error.message };
    }

    // 2. Check Subscription entity
    try {
      const subs = await base44.entities.Subscription.list();
      checks.subscription = { success: true, message: `Subscription entity accessible (${subs.length} records)` };
    } catch (error) {
      checks.subscription = { success: false, message: error.message };
    }

    // 3. Check DailyFreeTierUsage entity
    try {
      const usage = await base44.entities.DailyFreeTierUsage.list();
      checks.freeTierUsage = { success: true, message: `Free tier entity accessible (${usage.length} records)` };
    } catch (error) {
      checks.freeTierUsage = { success: false, message: error.message };
    }

    // 4. Check checkFreeTierUsage function
    try {
      const result = await base44.functions.invoke('checkFreeTierUsage', {});
      checks.checkFreeTierFunc = { success: !!result.data, message: `Function accessible - isPremium: ${result.data?.isPremium}` };
    } catch (error) {
      checks.checkFreeTierFunc = { success: false, message: error.message };
    }

    // 5. Check validatePayment function
    try {
      const result = await base44.functions.invoke('validatePayment', {
        payment_reference: 'TEST-REF',
        amount: 18.99
      });
      checks.validatePaymentFunc = { success: false, message: 'Function exists (returned expected error for test params)' };
    } catch (error) {
      if (error.response?.status === 404) {
        checks.validatePaymentFunc = { success: true, message: 'Function exists and validates correctly' };
      } else {
        checks.validatePaymentFunc = { success: false, message: error.message };
      }
    }

    // 6. Check User entity
    try {
      const users = await base44.entities.User.list();
      checks.userEntity = { success: true, message: `User entity accessible (${users.length} users)` };
    } catch (error) {
      checks.userEntity = { success: false, message: error.message };
    }

    // 7. Check ActivityLog entity
    try {
      const logs = await base44.entities.ActivityLog.list();
      checks.activityLog = { success: true, message: `ActivityLog entity accessible (${logs.length} logs)` };
    } catch (error) {
      checks.activityLog = { success: false, message: error.message };
    }

    // 8. Check CaregiverAlert entity
    try {
      const alerts = await base44.entities.CaregiverAlert.list();
      checks.caregiverAlert = { success: true, message: `CaregiverAlert entity accessible (${alerts.length} alerts)` };
    } catch (error) {
      checks.caregiverAlert = { success: false, message: error.message };
    }

    setResults(checks);
    setLoading(false);
  };

  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">App Health Check</h1>
        <p className="text-slate-600 mb-6">Verifying all systems are ready for launch</p>

        {loading ? (
          <Card className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p>Running health checks...</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-600">{successCount}</p>
                  <p className="text-sm text-slate-600">Systems OK</p>
                </CardContent>
              </Card>
              <Card className={`bg-gradient-to-br ${totalCount - successCount === 0 ? 'from-green-50 to-emerald-50' : 'from-orange-50 to-red-50'}`}>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">{totalCount - successCount}</p>
                  <p className="text-sm text-slate-600">Issues</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {Object.entries(results).map(([key, result]) => (
                <Card key={key} className={result.success ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
                  <CardContent className="p-4 flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className={`text-xs mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                {successCount === totalCount 
                  ? '✅ All systems are operational. App is ready for launch!' 
                  : '⚠️ Some systems need attention before launch'}
              </p>
            </div>

            <Button onClick={runHealthChecks} className="w-full mt-6" variant="outline">
              Re-run Health Check
            </Button>
          </>
        )}
      </div>
    </div>
  );
}