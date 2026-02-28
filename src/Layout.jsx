import React, { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import Footer from '@/components/Footer';
import { AppStateProvider } from '@/components/AppStateManager';
import { LockModeProvider } from '@/components/LockModeManager';
import OfflineIndicator from '@/components/OfflineIndicator';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import ScrollToTop from '@/components/ScrollToTop';
import { useSubscriptionStatus } from '@/components/SubscriptionGuard';
import SessionTimeoutManager from '@/components/SessionTimeoutManager';
import OfflineSyncStatus from '@/components/memory-mirror/OfflineSyncStatus';
import OfflineFeaturesBadge from '@/components/memory-mirror/OfflineFeaturesBadge';
import { TabStackProvider, useTabStack } from '@/components/TabStackManager';
import { FeatureLockProvider } from '@/components/FeatureLockManager';

// Add small delay to allow async checks
const SUBSCRIPTION_CHECK_TIMEOUT = 100;

/**
 * Memory Mirror - AI Companion for Dementia Care
 * EMERGENCY SIMPLIFIED VERSION - Removes all blocking initialization
 */

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: subscriptionData, isLoading } = useSubscriptionStatus();
  const { pushTab, getPreviousTab } = useTabStack();
  
  // (debug logging removed)
  
  const showFooter = currentPageName === 'Landing' || currentPageName === 'CaregiverPortal';
  const showBottomNav = !showFooter;
  
  // Check subscription access - allow pages to render while loading (no blocking)
  useEffect(() => {
    if (isLoading || !subscriptionData) return;
    
    const openPages = [
      'Paywall', 'Landing', 'CaregiverPortal', 'Registration', 'Pricing',
      'FAQ', 'PrivacyPolicy', 'TermsOfService', 'Resources', 'SubscriptionStatus',
      'AccessibilityStatement', 'DiagnosticTest'
    ];
    const isOpenPage = openPages.includes(currentPageName);
    const hasValidAccess = subscriptionData?.isSubscribed || subscriptionData?.isAdmin;

    if (!hasValidAccess && !isOpenPage) {
      navigate('/paywall');
    }
  }, [isLoading, subscriptionData, currentPageName, navigate]);

  // Main bottom tab pages for page transitions
  const mainPages = ['Home', 'ChatMode', 'PhoneMode', 'Security', 'NightWatch', 'OfflineAudio', 'SyncBackup', 'Feedback'];
  const isMainPage = mainPages.includes(currentPageName);

  // Track tab navigation for stack preservation
  useEffect(() => {
    const mainPages = ['Home', 'ChatMode', 'PhoneMode', 'Security', 'NightWatch', 'OfflineAudio', 'SyncBackup', 'Feedback', 'BigButtonMode'];
    if (mainPages.includes(currentPageName)) {
      pushTab(location.pathname);
    }
  }, [location.pathname, currentPageName, pushTab]);

  // Android-like back button behavior with tab stack preservation
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      
      if (currentPageName === 'Landing') {
        if (window.AndroidInterface?.exitApp) {
          window.AndroidInterface.exitApp();
        }
        return;
      }
      
      // Check if we should switch to previous tab
      const mainPages = ['Home', 'ChatMode', 'PhoneMode', 'Security', 'NightWatch', 'OfflineAudio', 'SyncBackup', 'Feedback', 'BigButtonMode'];
      if (mainPages.includes(currentPageName)) {
        const previousTab = getPreviousTab();
        if (previousTab) {
          navigate(previousTab, { state: { direction: 'back' } });
          return;
        }
      }
      
      navigate(-1);
    };

    const handleBackButton = (event) => {
      event.preventDefault();
      
      if (currentPageName === 'Home' || currentPageName === 'Landing') {
        if (window.AndroidInterface?.exitApp) {
          window.AndroidInterface.exitApp();
        } else {
          if (currentPageName === 'Home') {
            navigate('/');
          }
        }
        return;
      }
      
      const mainPages = ['Home', 'ChatMode', 'PhoneMode', 'Security', 'NightWatch', 'OfflineAudio', 'SyncBackup', 'Feedback', 'BigButtonMode'];
      if (mainPages.includes(currentPageName)) {
        const previousTab = getPreviousTab();
        if (previousTab) {
          navigate(previousTab, { state: { direction: 'back' } });
          return;
        }
      }
      
      navigate(-1);
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('backbutton', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('backbutton', handleBackButton);
    };
  }, [currentPageName, navigate, getPreviousTab]);

  // Prevent accidental navigation gestures on main app pages
  useEffect(() => {
    if (isMainPage) {
      document.body.style.overscrollBehavior = 'none';
      document.body.style.touchAction = 'pan-y';
      document.documentElement.style.overscrollBehavior = 'none';
    }
    
    return () => {
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [isMainPage]);

  // Handle back gesture on iOS/Android
  useEffect(() => {
    let touchStartX = 0;
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      // Right swipe > 50px = back
      if (touchEndX - touchStartX > 50 && touchStartX < 30) {
        navigate(-1);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, false);
      document.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [navigate]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AppStateProvider>
          <LockModeProvider>
            <FeatureLockProvider>
              <TabStackProvider>
                <ErrorBoundary>
                <SessionTimeoutManager />
                <OfflineIndicator />
                <OfflineSyncStatus />
                <OfflineFeaturesBadge />
                <ScrollToTop />
              
              <div 
                className="min-h-screen bg-background text-foreground flex flex-col"
                style={{
                  paddingTop: '0px',
                  paddingBottom: showBottomNav ? '160px' : '20px',
                  overscrollBehaviorY: 'none'
                }}
                lang="en"
              >
                <main 
                  id="main-content" 
                  className="flex-1 relative overflow-auto"
                  role="main"
                  aria-label="Main content"
                >
                  <AnimatePresence mode="wait" initial={false} custom={location.state?.direction}>
                    {isMainPage ? (
                      <motion.div
                        key={location.pathname}
                        custom={location.state?.direction}
                        initial={(custom) => ({
                          x: custom === 'back' ? -300 : 300,
                          opacity: 0
                        })}
                        animate={{ x: 0, opacity: 1 }}
                        exit={(custom) => ({
                          x: custom === 'back' ? 300 : -300,
                          opacity: 0
                        })}
                        transition={{ 
                          type: 'tween', 
                          duration: 0.25, 
                          ease: [0.4, 0.0, 0.2, 1] // Material Design easing
                        }}
                        className="absolute inset-0"
                      >
                        {children}
                      </motion.div>
                    ) : (
                      <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        {children}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>
                {showFooter && <Footer />}
                {showBottomNav && <BottomNav />}
              </div>
              </ErrorBoundary>
              </TabStackProvider>
            </FeatureLockProvider>
          </LockModeProvider>
        </AppStateProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <TabStackProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </TabStackProvider>
  );
}