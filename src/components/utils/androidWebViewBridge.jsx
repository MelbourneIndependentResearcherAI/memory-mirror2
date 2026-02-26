/**
 * Android WebView Bridge - Native-like Navigation
 * Handles communication between web app and Android WebView
 */

// Initialize Android interface detection
export const isAndroidWebView = () => {
  return typeof window.AndroidInterface !== 'undefined' || 
         /Android/i.test(navigator.userAgent);
};

// Handle back button press
export const handleAndroidBack = (currentPage, navigate) => {
  // Home/Landing pages - exit app
  if (currentPage === 'Home' || currentPage === 'Landing') {
    if (window.AndroidInterface?.exitApp) {
      window.AndroidInterface.exitApp();
    } else {
      // Web fallback
      if (currentPage === 'Home') {
        navigate('/', { replace: true });
      }
    }
    return true;
  }
  
  // Other pages - navigate back
  navigate(-1);
  return true;
};

// Prevent default back behavior
export const preventDefaultBack = () => {
  window.history.pushState(null, '', window.location.pathname);
};

// Setup back button listener
export const setupBackButtonListener = (callback) => {
  // Android hardware back button (Cordova/Capacitor)
  const handleBackButton = (e) => {
    e.preventDefault();
    callback();
  };
  
  // Browser popstate
  const handlePopState = (e) => {
    e.preventDefault();
    callback();
  };
  
  document.addEventListener('backbutton', handleBackButton);
  window.addEventListener('popstate', handlePopState);
  
  return () => {
    document.removeEventListener('backbutton', handleBackButton);
    window.removeEventListener('popstate', handlePopState);
  };
};

// Notify Android of page changes
export const notifyPageChange = (pageName) => {
  if (window.AndroidInterface?.onPageChange) {
    window.AndroidInterface.onPageChange(pageName);
  }
};

// Get Android status bar height
export const getAndroidStatusBarHeight = () => {
  if (window.AndroidInterface?.getStatusBarHeight) {
    return window.AndroidInterface.getStatusBarHeight();
  }
  return 0;
};

// Enable/disable Android gestures
export const setAndroidGesturesEnabled = (enabled) => {
  if (window.AndroidInterface?.setGesturesEnabled) {
    window.AndroidInterface.setGesturesEnabled(enabled);
  }
};

// Haptic feedback (native-like)
export const triggerHapticFeedback = (type = 'light') => {
  if (window.AndroidInterface?.vibrate) {
    const duration = {
      light: 10,
      medium: 20,
      heavy: 30
    }[type] || 10;
    window.AndroidInterface.vibrate(duration);
  } else if (navigator.vibrate) {
    navigator.vibrate(type === 'light' ? 10 : type === 'medium' ? 20 : 30);
  }
};

export default {
  isAndroidWebView,
  handleAndroidBack,
  preventDefaultBack,
  setupBackButtonListener,
  notifyPageChange,
  getAndroidStatusBarHeight,
  setAndroidGesturesEnabled,
  triggerHapticFeedback
};