/**
 * Android WebView Optimizer Component
 * Applies Android WebView optimizations and initializes bridge on app load
 */

import { useEffect } from 'react';
import androidBridge from '@/components/utils/androidWebViewBridge';
import { applyAndroidWebViewConfig } from '@/components/utils/androidWebViewConfig';

export default function AndroidWebViewOptimizer() {
  useEffect(() => {
    // Apply Android WebView configuration
    applyAndroidWebViewConfig();

    // Initialize Android bridge features
    if (androidBridge.isAndroidWebView) {
      console.log('🔧 Initializing Android WebView optimizations...');

      // 1. Handle offline status
      androidBridge.onNativeMessage('offlineStatusRequest', async () => {
        const status = await androidBridge.getOfflineStatus();
        console.log('📊 Offline Status:', status);
      });

      // 2. Listen for emergency alerts from native
      androidBridge.onEmergencyAlert((data) => {
        console.log('🚨 Emergency Alert from native:', data);
        // Handle emergency alert in app
      });

      // 3. Listen for notifications from native
      androidBridge.onNotification((data) => {
        console.log('🔔 Notification from native:', data);
      });

      // 4. Setup device orientation handler
      window.addEventListener('orientationchange', () => {
        const orientation = window.orientation || 'unknown';
        androidBridge.trackEvent('orientation_changed', { orientation });
      });

      // 5. Setup online/offline handlers for native
      window.addEventListener('online', () => {
        androidBridge.trackEvent('connection_online');
      });

      window.addEventListener('offline', () => {
        androidBridge.trackEvent('connection_offline');
      });

      // 6. Handle visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          androidBridge.trackEvent('app_backgrounded');
        } else {
          androidBridge.trackEvent('app_foregrounded');
        }
      });

      // 7. Request device info on startup
      androidBridge.getDeviceInfo().then((info) => {
        console.log('📱 Device Info:', info);
      });

      // 8. Apply safe area padding if needed
      const applyOffsets = () => {
        const root = document.getElementById('root');
        if (root) {
          root.style.paddingTop = 'var(--safe-area-top)';
          root.style.paddingBottom = 'var(--safe-area-bottom)';
        }
      };
      applyOffsets();
      window.addEventListener('resize', applyOffsets);

      // 9. Prevent accidental navigation back
      window.addEventListener('popstate', (e) => {
        androidBridge.trackEvent('back_pressed');
        // Let app handle back button via Bridge
      });

      console.log('✅ Android WebView optimizations complete');
    }

    return () => {
      // Cleanup listeners if needed
    };
  }, []);

  // This component doesn't render anything
  return null;
}