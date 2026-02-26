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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-blue-950 dark:via-cyan-950 dark:to-purple-950">
      {/* Download Progress Overlay */}
      {showDownloadProgress && (
        <OfflineDownloadProgress 
          onComplete={() => {
            setTimeout(() => setShowDownloadProgress(false), 3000);
          }}
          autoStart={true}
        />
      )}

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
            <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow-lg">Offline Audio</h1>
            <p className="text-blue-100 text-sm mt-1">Access music and stories without internet</p>
          </div>
        </div>
      </div>

      {/* Quick Download Trigger - Premium */}
      <div className="max-w-6xl mx-auto p-6">
        <Button
          onClick={() => setShowDownloadProgress(true)}
          size="lg"
          className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 hover:from-blue-700 hover:via-cyan-700 hover:to-purple-700 w-full shadow-premium font-bold text-lg py-7 rounded-2xl"
        >
          📥 Download Offline Content (335+ Items)
        </Button>
      </div>

      {/* Content - Premium Container */}
      <div className="pb-20 max-w-6xl mx-auto px-6">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-premium-lg border-2 border-blue-200 dark:border-blue-800 p-6 md:p-8">
          <OfflineAudioLibrary />
        </div>
      </div>

      <PageLoadTip pageName="OfflineAudio" />
    </div>
  );
}