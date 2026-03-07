import React, { useEffect, Suspense } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

import { LanguageProvider } from '@/components/i18n/LanguageContext';
import { AppStateProvider } from '@/components/AppStateManager';
import { LockModeProvider } from '@/components/LockModeManager';
import { FeatureLockProvider } from '@/components/FeatureLockManager';
import { TabStackProvider, useTabStack } from '@/components/TabStackManager';

import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import UserRegistrationGate from '@/components/UserRegistrationGate';
import AndroidAppBar from '@/components/AndroidAppBar';
import ScrollToTop from '@/components/ScrollToTop';

const noGatePages = ['Landing', 'PrivacyPolicy', 'TermsOfService', 'FAQ', 'Resources', 'Pricing', 'PatientAccess'];
const noNavPages = ['Landing', 'PrivacyPolicy', 'TermsOfService', 'FAQ', 'Resources', 'Pricing', 'PatientAccess', 'QuickAccess', 'BigButtonMode'];
const mainPages = ['Home', 'ChatMode', 'PhoneMode', 'Security', 'NightWatch', 'OfflineAudio', 'SyncBackup', 'Feedback', 'BigButtonMode'];

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pushTab, getPreviousTab } = useTabStack();

  const requiresRegistration = !noGatePages.includes(currentPageName);
  const showBottomNav = !noNavPages.includes(currentPageName);
  const showFooter = currentPageName === 'Landing' || currentPageName === 'CaregiverPortal';
  const showAppBar = !['Landing'].includes(currentPageName) && !showFooter;
  const isMainPage = mainPages.includes(currentPageName);

  // Track tab navigation
  useEffect(() => {
    if (mainPages.includes(currentPageName)) {
      pushTab(location.pathname);
    }
  }, [location.pathname, currentPageName, pushTab]);

  // Android back button behavior
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      if (currentPageName === 'Landing') {
        window.AndroidInterface?.exitApp?.();
        return;
      }
      if (mainPages.includes(currentPageName)) {
        const previousTab = getPreviousTab();
        if (previousTab) { navigate(previousTab, { state: { direction: 'back' } }); return; }
      }
      navigate(-1);
    };

    const handleBackButton = (event) => {
      event.preventDefault();
      if (currentPageName === 'Home' || currentPageName === 'Landing') {
        if (window.AndroidInterface?.exitApp) { window.AndroidInterface.exitApp(); }
        else if (currentPageName === 'Home') { navigate('/'); }
        return;
      }
      if (mainPages.includes(currentPageName)) {
        const previousTab = getPreviousTab();
        if (previousTab) { navigate(previousTab, { state: { direction: 'back' } }); return; }
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

  // Prevent overscroll on main pages
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

  // iOS/Android swipe back gesture
  useEffect(() => {
    let touchStartX = 0;
    const handleTouchStart = (e) => { touchStartX = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchEndX - touchStartX > 50 && touchStartX < 30) { navigate(-1); }
    };
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart, false);
      document.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [navigate]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div
        className="min-h-screen text-foreground flex flex-col"
        style={{
          paddingBottom: showBottomNav ? '160px' : '20px',
          overscrollBehavior: 'none',
        }}
      >
        <ScrollToTop />
        {requiresRegistration && <UserRegistrationGate />}
        {showAppBar && <AndroidAppBar title={currentPageName} />}

        <Suspense fallback={<>{children}</>}>
          <main id="main-content" className="flex-1 relative overflow-auto" role="main">
            <AnimatePresence mode="wait" initial={false} custom={location.state?.direction}>
              {isMainPage ? (
                <motion.div
                  key={location.pathname}
                  custom={location.state?.direction}
                  initial={(custom) => ({ x: custom === 'back' ? -300 : 300, opacity: 0 })}
                  animate={{ x: 0, opacity: 1 }}
                  exit={(custom) => ({ x: custom === 'back' ? 300 : -300, opacity: 0 })}
                  transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
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
        </Suspense>

        <Suspense fallback={null}>
          {showFooter && <Footer />}
          {showBottomNav && <BottomNav />}
        </Suspense>
      </div>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LockModeProvider>
        <FeatureLockProvider>
          <TabStackProvider>
            <AppStateProvider>
              <LayoutContent children={children} currentPageName={currentPageName} />
            </AppStateProvider>
          </TabStackProvider>
        </FeatureLockProvider>
      </LockModeProvider>
    </LanguageProvider>
  );
}