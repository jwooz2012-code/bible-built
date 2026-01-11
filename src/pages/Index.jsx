import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const homePath = createPageUrl('Home');
    console.log('[INDEX] Current pathname:', location.pathname);
    console.log('[INDEX] Redirecting to Home:', homePath);
    navigate(homePath, { replace: true });
  }, [navigate, location.pathname]);

  return null;
}