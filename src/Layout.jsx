import React from 'react';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import Footer from '@/components/Footer';
import { AppStateProvider } from '@/components/AppStateManager';
import { LockModeProvider } from '@/components/LockModeManager';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * Memory Mirror - AI Companion for Dementia Care
 * Copyright © 2026 Memory Mirror. All Rights Reserved.
 * Proprietary and Confidential.
 */
import BottomNav from '@/components/BottomNav';
import ScrollToTop from '@/components/ScrollToTop';
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

// Initialize app capabilities on load - wrapped in try/catch to prevent blocking
if (typeof window !== 'undefined') {
  // Bug fixes - non-blocking
  setTimeout(() => {
    import('@/components/utils/bugFixes').then(module => {
      module.initAllBugFixes();
    }).catch(() => {});
  }, 0);
  
  // Error logging - non-blocking
  setTimeout(() => {
    try {
      initGlobalErrorHandler();
    } catch {}
  }, 0);
  
  // Initialize offline storage - non-blocking
  setTimeout(() => {
    Promise.all([
      initOfflineDB().catch(() => {}),
      initOfflineStorage().catch(() => {}),
      offlineDataCache.init().catch(() => {})
    ]).catch(() => {});
  }, 100);
  
  // Service worker - non-blocking
  setTimeout(() => {
    try {
      registerServiceWorker();
      requestPersistentStorage();
    } catch {}
  }, 200);
  
  // Cache remote data - non-blocking
  setTimeout(() => {
    const CACHE_KEY = 'last_cache_time';
    const lastCache = localStorage.getItem(CACHE_KEY);
    const CACHE_INTERVAL = 10 * 60 * 1000;
    
    if (navigator.onLine && (!lastCache || Date.now() - parseInt(lastCache) > CACHE_INTERVAL)) {
      offlineSyncManager.cacheRemoteData().then(() => {
        localStorage.setItem(CACHE_KEY, Date.now().toString());
      }).catch(() => {});
    }
  }, 500);
  
  // Preload data - non-blocking
  setTimeout(() => {
    const PRELOAD_KEY = 'offline_preload_session';
    const lastPreload = sessionStorage.getItem(PRELOAD_KEY);
    const ONE_HOUR = 60 * 60 * 1000;
    
    if (!lastPreload || Date.now() - parseInt(lastPreload) > ONE_HOUR) {
      import('@/components/utils/offlinePreloader').then(module => {
        module.default().catch(() => {});
        sessionStorage.setItem(PRELOAD_KEY, Date.now().toString());
      }).catch(() => {});
    }
  }, 1000);
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const showFooter = currentPageName === 'Landing' || currentPageName === 'CaregiverPortal';
  const showBottomNav = !showFooter;

  // Main bottom tab pages for page transitions
  const mainPages = ['Home', 'ChatMode', 'PhoneMode', 'Security', 'NightWatch', 'OfflineAudio', 'SyncBackup', 'Feedback'];
  const isMainPage = mainPages.includes(currentPageName);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AccessibilityWrapper>
          <LanguageProvider>
              <AppStateProvider>
                <LockModeProvider>
                  <ErrorBoundary>
                    <AndroidWebViewOptimizer />
                    <ScrollToTop />
                    <OfflineStatusBar />
                    <OfflineSyncIndicator />
                    <ReminderNotification />
                    <div 
                      className="min-h-screen bg-background text-foreground flex flex-col"
                      style={{
                        paddingTop: 'calc(env(safe-area-inset-top) + 60px)',
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
  );
}