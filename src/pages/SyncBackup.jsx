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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-blue-950 dark:via-cyan-950 dark:to-purple-950">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 text-white p-6 shadow-premium-lg border-b-4 border-white/20">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-white/20 text-white min-h-[44px] min-w-[44px]"
          >
            <ChevronLeft className="w-7 h-7" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow-lg">Sync & Backup</h1>
            <p className="text-blue-100 text-sm mt-1">Keep your data safe and synchronized</p>
          </div>
        </div>
      </div>

      {/* Content - Premium Container */}
      <div className="pb-20 max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-premium-lg border-2 border-blue-200 dark:border-blue-800 p-6 md:p-8">
          <SyncBackupManager />
        </div>
      </div>

      <PageLoadTip pageName="SyncBackup" />
    </div>
  );
}