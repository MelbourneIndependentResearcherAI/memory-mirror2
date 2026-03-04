import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// App is free — redirect paywall to Home
export default function Paywall() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(createPageUrl('Home'), { replace: true });
  }, [navigate]);
  return null;
}