import React from 'react';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import Footer from '@/components/Footer';
import { AppStateProvider } from '@/components/AppStateManager';
import { LockModeProvider } from '@/components/LockModeManager';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import ScrollToTop from '@/components/ScrollToTop';

/**
 * Memory Mirror - AI Companion for Dementia Care
 * EMERGENCY SIMPLIFIED VERSION - Removes all blocking initialization
 */

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const showFooter = currentPageName === 'Landing' || currentPageName === 'CaregiverPortal';
  const showBottomNav = !showFooter;

  // Main bottom tab pages for page transitions
  const mainPages = ['Home', 'ChatMode', 'PhoneMode', 'Security', 'NightWatch', 'OfflineAudio', 'SyncBackup', 'Feedback'];
  const isMainPage = mainPages.includes(currentPageName);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AppStateProvider>
          <LockModeProvider>
            <ErrorBoundary>
              <ScrollToTop />
              <div 
                className="min-h-screen bg-background text-foreground flex flex-col"
                style={{
                  paddingTop: '60px',
                  paddingBottom: showBottomNav ? '100px' : '20px',
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
    </ThemeProvider>
  );
}