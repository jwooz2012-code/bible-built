import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Force navigation to Home page
    navigate(createPageUrl('home'), { replace: true });
  }, [navigate]);

  return null;
}