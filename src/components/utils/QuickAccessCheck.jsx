import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * QuickAccessCheck - Automatically redirects patients to Quick Access page
 * if the Quick Access setting is enabled in Caregiver Settings.
 * 
 * This component redirects ONLY on the Landing page, and ONLY if not already
 * on the QuickAccess page. This prevents redirect loops.
 */
export default function QuickAccessCheck() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check on Landing page
    if (location.pathname !== '/' && location.pathname !== '/Landing') {
      return;
    }

    // Check if Quick Access is enabled
    try {
      const quickAccessEnabled = localStorage.getItem('quickAccessEnabled');
      if (quickAccessEnabled === 'true') {
        // Redirect to Quick Access page
        navigate(createPageUrl('QuickAccess'), { replace: true });
      }
    } catch (error) {
      console.error('Failed to check Quick Access setting:', error);
    }
  }, [location.pathname, navigate]);

  return null; // This is a utility component with no UI
}