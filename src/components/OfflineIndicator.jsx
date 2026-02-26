import { useEffect, useState } from 'react';
import { offlineStatus } from '@/components/utils/offlineStatusManager';
import { AlertCircle } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(offlineStatus.getStatus());

    const unsubscribe = offlineStatus.onStatusChange((online) => {
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-amber-100 dark:bg-amber-900 border-b-2 border-amber-400 dark:border-amber-600 px-4 py-3 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-300 flex-shrink-0" />
      <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
        Offline mode: Using cached responses until connection returns
      </span>
    </div>
  );
}