import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SyncBackupManager from '@/components/memory-mirror/SyncBackupManager.jsx';
import { setupAutoSync } from '@/components/utils/syncManager';

export default function SyncBackup() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = setupAutoSync();
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:from-blue-950 dark:via-cyan-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-white/20 text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">Sync & Backup</h1>
      </div>

      {/* Content */}
      <div className="pb-20">
        <SyncBackupManager />
      </div>

      <PageLoadTip pageName="SyncBackup" />
    </div>
  );
}