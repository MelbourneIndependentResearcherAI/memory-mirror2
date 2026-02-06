import React from 'react';
import { ThemeProvider } from 'next-themes';

export default function Layout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div 
        className="min-h-screen bg-background text-foreground"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          overscrollBehaviorY: 'none'
        }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}