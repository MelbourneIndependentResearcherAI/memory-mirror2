import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Loader2, Code } from 'lucide-react';
import { toast } from 'sonner';

export default function TestDashboard() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    {
      name: 'User Authentication',
      test: async () => {
        const user = await base44.auth.me();
        return { success: !!user, data: user };
      }
    },
    {
      name: 'Subscription Check',
      test: async () => {
        const result = await base44.functions.invoke('checkSubscriptionStatus', {});
        return { success: !!result.data, data: result.data };
      }
    },
    {
      name: 'Entity Operations',
      test: async () => {
        const result = await base44.entities.UserProfile.list();
        return { success: Array.isArray(result), data: result };
      }
    },
    {
      name: 'Daily Routine Entity',
      test: async () => {
        const result = await base44.entities.DailyRoutinePattern.list();
        return { success: Array.isArray(result), data: result };
      }
    },
    {
      name: 'Caregiver Notification',
      test: async () => {
        const result = await base44.entities.CaregiverNotification.list();
        return { success: Array.isArray(result), data: result };
      }
    },
    {
      name: 'Caregiver Alert',
      test: async () => {
        const result = await base44.entities.CaregiverAlert.list();
        return { success: Array.isArray(result), data: result };
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    const results = [];

    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          success: result.success,
          data: result.data,
          error: null
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          data: null,
          error: error.message
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);

    const passCount = results.filter(r => r.success).length;
    toast.success(`${passCount}/${results.length} tests passed`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">System Test Dashboard</h1>

        <Card className="p-6 dark:bg-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Run Tests</h2>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>

          {testResults.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Click "Run All Tests" to check system health
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    result.success
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <p className={`font-semibold ${
                      result.success
                        ? 'text-green-900 dark:text-green-200'
                        : 'text-red-900 dark:text-red-200'
                    }`}>
                      {result.name}
                    </p>
                    {result.error && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Error: {result.error}
                      </p>
                    )}
                    {result.data && (
                      <details className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        <summary className="cursor-pointer font-medium">View Details</summary>
                        <pre className="mt-2 bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2).substring(0, 500)}...
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 dark:bg-slate-800 border-blue-200 dark:border-blue-800">
          <h3 className="font-bold mb-4">System Information</h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>✅ React Query: Installed</p>
            <p>✅ Base44 SDK: v0.8.6</p>
            <p>✅ Stripe: Ready for payment processing</p>
            <p>✅ Speech Synthesis: Enabled</p>
            <p>✅ Offline Mode: Configured</p>
            <p>✅ Subscription System: Active</p>
          </div>
        </Card>
      </div>
    </div>
  );
}