import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import Footer from '@/components/Footer';
import AgentSupport from '@/components/caregiver/AgentSupport';
import BottomNav from '@/components/BottomNav';
import OfflineIndicator from '@/components/memory-mirror/OfflineIndicator';
import OfflineBanner from '@/components/memory-mirror/OfflineBanner';
import { initOfflineDB } from '@/components/utils/offlineManager';
import { initOfflineStorage } from '@/components/utils/offlineStorage';
import { registerServiceWorker, requestPersistentStorage } from '@/components/utils/serviceWorkerRegister';

// Initialize offline capabilities on app load
if (typeof window !== 'undefined') {
  // Initialize offline storage immediately
  initOfflineDB().catch(e => console.log('Offline DB init (optional):', e.message));
  initOfflineStorage().catch(e => console.log('Offline storage init:', e.message));
  
  // Request persistent storage for offline data
  requestPersistentStorage();
  
  // Preload essential data for 100% offline mode
  import('@/components/utils/offlinePreloader').then(module => {
    module.preloadEssentialData().catch(e => 
      console.log('Preload warning:', e.message)
    );
  });
}

// Optimized query configuration for fast, reliable data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function Layout({ children, currentPageName }) {
  const showFooter = currentPageName === 'Landing' || currentPageName === 'CaregiverPortal';
  const showBottomNav = !showFooter; // Show bottom nav on all pages except landing and caregiver portal

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ErrorBoundary>
          <OfflineBanner />
          <OfflineIndicator />
          <div 
            className="min-h-screen bg-background text-foreground flex flex-col"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: showBottomNav ? 'calc(80px + env(safe-area-inset-bottom))' : 'calc(20px + env(safe-area-inset-bottom))',
              overscrollBehaviorY: 'none'
            }}
          >
            <div className="flex-1">
              {children}
            </div>
            {showFooter && <Footer />}
            {showBottomNav && <BottomNav />}
          </div>
          <AgentSupport />
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}