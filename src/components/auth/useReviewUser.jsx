import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Set to true for App Store review build, false for production
const IS_REVIEW_BUILD = true;

const MOCK_REVIEWER = {
  id: "app_store_reviewer_temp_id_123",
  email: "reviewer@builtbytheword.app",
  full_name: "App Store Reviewer",
  role: "user"
};

export function useReviewUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (IS_REVIEW_BUILD) {
        setUser(MOCK_REVIEWER);
        setIsLoading(false);
      } else {
        try {
          const authenticatedUser = await base44.auth.me();
          setUser(authenticatedUser);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading };
}