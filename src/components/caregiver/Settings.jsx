import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Loader2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Settings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [useQuickAccess, setUseQuickAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Quick Access preference
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('quickAccessEnabled');
        setUseQuickAccess(saved === 'true');
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const toggleQuickAccess = (enabled) => {
    setUseQuickAccess(enabled);
    try {
      localStorage.setItem('quickAccessEnabled', enabled.toString());
      toast.success(
        enabled 
          ? '✅ Quick Access enabled - Landing page will automatically redirect to the big red button' 
          : 'Quick Access disabled - Landing page shows normal interface'
      );
      
      // Refresh the page to apply changes immediately
      if (enabled) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch {
      toast.error('Failed to save setting');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      const user = await base44.auth.me();
      
      // Delete all user's data
      const entities = ['Memory', 'SafeMemoryZone', 'EmergencyContact', 'AnxietyTrend', 'SecurityLog', 'Conversation'];
      await Promise.all(
        entities.map(entity => 
          base44.entities[entity].list().then(items => 
            Promise.all(items.filter(item => item.created_by === user.email).map(item => 
              base44.entities[entity].delete(item.id).catch(() => {})
            ))
          ).catch(() => {})
        )
      );

      // Logout and redirect to landing page
      await base44.auth.logout('/');
      // Fallback navigation in case logout doesn't redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch {
      setDeleteError('Failed to delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Access Settings - Inspired by "Be My Eyes" */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Quick Access Button
          </CardTitle>
          <CardDescription>
            One big red button for easy access - inspired by "Be My Eyes" app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Enable Quick Access Mode</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                Shows a single large red button that's easy to find and press. Perfect for patients who struggle with finding apps or answering their phone.
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 Tip: Add the Quick Access page to the home screen for instant one-tap launch
              </p>
            </div>
            <Switch
              checked={useQuickAccess}
              onCheckedChange={toggleQuickAccess}
              disabled={loading}
            />
          </div>

          {useQuickAccess && (
            <Alert>
              <AlertDescription className="text-sm">
                ✅ Quick Access is enabled. Patients will see a big red button on the landing page. You can also direct them to the Quick Access page directly for the simplest experience.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently delete your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div>
                <h3 className="font-semibold text-sm mb-1">Delete Account</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="min-h-[44px] min-w-[44px]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2 text-red-600 dark:text-red-400">
                  Are you absolutely sure?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  This action cannot be undone. This will permanently delete:
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1 ml-2">
                  <li>All memories and safe zones</li>
                  <li>All emergency contacts</li>
                  <li>All conversation history</li>
                  <li>All anxiety trends and security logs</li>
                  <li>Your account</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 min-h-[44px]"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Everything
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}