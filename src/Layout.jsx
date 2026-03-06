import React from 'react';
import { Toaster } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import { LockModeProvider } from '@/components/LockModeManager';
import { FeatureLockProvider } from '@/components/FeatureLockManager';
import { TabStackProvider } from '@/components/TabStackManager';
import { AppStateProvider } from '@/components/AppStateManager';
import UserRegistrationGate from '@/components/UserRegistrationGate';
import ScrollToTop from '@/components/ScrollToTop';

// Pages that don't require the registration gate
const noGatePages = [
  'Landing', 'PrivacyPolicy', 'TermsOfService', 'FAQ',
  'Resources', 'Pricing', 'PatientAccess'
];

// Pages that don't show the bottom navigation bar
const noNavPages = [
  'Landing', 'PrivacyPolicy', 'TermsOfService', 'FAQ',
  'Resources', 'Pricing', 'PatientAccess', 'QuickAccess',
  'BigButtonMode'
];

export default function Layout({ children, currentPageName }) {
  const requiresRegistration = !noGatePages.includes(currentPageName);
  const showBottomNav = !noNavPages.includes(currentPageName);

  return (
    <LanguageProvider>
      <LockModeProvider>
        <FeatureLockProvider>
          <TabStackProvider>
            <AppStateProvider>
              <div
                className="min-h-screen bg-background text-foreground flex flex-col"
                style={{
                  paddingBottom: showBottomNav ? '160px' : '20px',
                  overscrollBehavior: 'none',
                  WebkitOverscrollBehavior: 'none'
                }}
              >
                <ScrollToTop />
                {requiresRegistration && <UserRegistrationGate />}
                {children}
                {showBottomNav && <BottomNav />}
              </div>
              <Toaster position="top-center" richColors />
            </AppStateProvider>
          </TabStackProvider>
        </FeatureLockProvider>
      </LockModeProvider>
    </LanguageProvider>
  );
}