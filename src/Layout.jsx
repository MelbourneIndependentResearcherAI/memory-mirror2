import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import Footer from '@/components/Footer';

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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ErrorBoundary>
          <div 
            className="min-h-screen bg-background text-foreground flex flex-col"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              overscrollBehaviorY: 'none'
            }}
          >
            <div className="flex-1">
              {children}
            </div>
            {showFooter && <Footer />}
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}