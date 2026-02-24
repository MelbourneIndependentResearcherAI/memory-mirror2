import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import GlobalLanguageSelector from '@/components/i18n/GlobalLanguageSelector';
import Footer from '@/components/Footer';
import { AppStateProvider } from '@/components/AppStateManager';
import { LockModeProvider } from '@/components/LockModeManager';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * Memory Mirror Application Layout
 * Copyright © 2026 Memory Mirror. All Rights Reserved.
 * Proprietary and Confidential.
 */
import BottomNav from '@/components/BottomNav';
import ScrollToTop from '@/components/ScrollToTop';
import OfflineIndicator from '@/components/memory-mirror/OfflineIndicator';
import OfflineSyncIndicator from '@/components/memory-mirror/OfflineSyncIndicator';
import ReminderNotification from '@/components/memory-mirror/ReminderNotification';
import OfflineStatusBar from '@/components/memory-mirror/OfflineStatusBar';
import { initOfflineDB } from '@/components/utils/offlineManager';
import { initOfflineStorage } from '@/components/utils/offlineStorage';
import { registerServiceWorker, requestPersistentStorage } from '@/components/utils/serviceWorkerRegister';
import { offlineSyncManager } from '@/components/utils/offlineSyncManager';
import { offlineDataCache } from '@/components/utils/offlineDataCache';
import { initGlobalErrorHandler } from '@/components/utils/errorLogger';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import AndroidWebViewOptimizer from '@/components/AndroidWebViewOptimizer';

// Initialize app capabilities on load
if (typeof window !== 'undefined') {
  // Bug fixes
  import('@/components/utils/bugFixes').then(module => {
    module.initAllBugFixes();
  }).catch(e => console.log('Bug fixes init:', e.message));
  
  // Error logging
  initGlobalErrorHandler();
  
  // Initialize offline storage immediately
  initOfflineDB().catch(e => console.log('Offline DB init (optional):', e.message));
  initOfflineStorage().catch(e => console.log('Offline storage init:', e.message));
  offlineDataCache.init().catch(e => console.log('Offline data cache init:', e.message));
  
  // Register service worker for offline support
  registerServiceWorker();
  
  // Request persistent storage for offline data
  requestPersistentStorage();
  
  // Cache remote data only if not recently done
  const CACHE_KEY = 'last_cache_time';
  const lastCache = localStorage.getItem(CACHE_KEY);
  const CACHE_INTERVAL = 10 * 60 * 1000; // 10 minutes
  
  if (navigator.onLine && (!lastCache || Date.now() - parseInt(lastCache) > CACHE_INTERVAL)) {
    offlineSyncManager.cacheRemoteData().then(() => {
      localStorage.setItem(CACHE_KEY, Date.now().toString());
    }).catch(e => console.log('Cache preload:', e.message));
  }
  
  // Preload essential data only once per session
  const PRELOAD_KEY = 'offline_preload_session';
  const lastPreload = sessionStorage.getItem(PRELOAD_KEY);
  const ONE_HOUR = 60 * 60 * 1000;
  
  if (!lastPreload || Date.now() - parseInt(lastPreload) > ONE_HOUR) {
    import('@/components/utils/offlinePreloader').then(module => {
      module.default().catch(e => 
        console.log('Preload warning:', e.message || 'Offline preload skipped')
      );
      sessionStorage.setItem(PRELOAD_KEY, Date.now().toString());
    });
  }
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
  const location = useLocation();
  const showFooter = currentPageName === 'Landing' || currentPageName === 'CaregiverPortal';
  const showBottomNav = !showFooter;

  // Main bottom tab pages for page transitions
  const mainPages = ['Home', 'ChatMode', 'PhoneMode', 'Security', 'NightWatch', 'OfflineAudio', 'SyncBackup', 'Feedback'];
  const isMainPage = mainPages.includes(currentPageName);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AccessibilityWrapper>
          <LanguageProvider>
              <AppStateProvider>
                <LockModeProvider>
                  <ErrorBoundary>
                    <AndroidWebViewOptimizer />
                    <ScrollToTop />
                    <GlobalLanguageSelector />
                    <OfflineStatusBar />
                    <OfflineIndicator />
                    <OfflineSyncIndicator />
                    <ReminderNotification />
                    <div 
                      className="min-h-screen bg-background text-foreground flex flex-col"
                      style={{
                        paddingTop: 'env(safe-area-inset-top)',
                        paddingBottom: showBottomNav ? 'calc(100px + env(safe-area-inset-bottom))' : 'calc(20px + env(safe-area-inset-bottom))',
                        overscrollBehaviorY: 'none'
                      }}
                    >
                      <div className="flex-1 relative overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                          {isMainPage ? (
                            <motion.div
                              key={location.pathname}
                              initial={{ x: 300, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -300, opacity: 0 }}
                              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                              className="absolute inset-0"
                            >
                              {children}
                            </motion.div>
                          ) : (
                            <div>{children}</div>
                          )}
                        </AnimatePresence>
                      </div>
                      {showFooter && <Footer />}
                      {showBottomNav && <BottomNav />}
                    </div>
                  </ErrorBoundary>
                </LockModeProvider>
              </AppStateProvider>
            </LanguageProvider>
          </AccessibilityWrapper>
        </ThemeProvider>
      </QueryClientProvider>
          );
          }