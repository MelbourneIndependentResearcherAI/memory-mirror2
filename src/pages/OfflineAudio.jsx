import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import OfflineAudioLibrary from '@/components/memory-mirror/OfflineAudioLibrary';
import OfflineDownloadProgress from '@/components/memory-mirror/OfflineDownloadProgress';
import PageLoadTip from '@/components/tips/PageLoadTip';

export default function OfflineAudio() {
  const navigate = useNavigate();
  const [showDownloadProgress, setShowDownloadProgress] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:from-blue-950 dark:via-cyan-950 dark:to-slate-900">
      {/* Download Progress Overlay */}
      {showDownloadProgress && (
        <OfflineDownloadProgress 
          onComplete={() => {
            setTimeout(() => setShowDownloadProgress(false), 3000);
          }}
          autoStart={true}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-white/20 text-white min-h-[44px] min-w-[44px]"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">Offline Audio</h1>
      </div>

      {/* Quick Download Trigger */}
      <div className="p-4">
        <Button
          onClick={() => setShowDownloadProgress(true)}
          className="bg-blue-600 hover:bg-blue-700 w-full"
        >
          📥 View Offline Download Progress
        </Button>
      </div>

      {/* Content */}
      <div className="pb-20">
        <OfflineAudioLibrary />
      </div>

      <PageLoadTip pageName="OfflineAudio" />
    </div>
  );
}