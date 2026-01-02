import { useQuery } from '@tanstack/react-query';
import { useGuestMode } from './GuestModeProvider';
import { base44 } from '@/api/base44Client';

export const useGuestSafeQuery = ({ queryKey, entity, operation = 'list', filter = null, enabled = true }) => {
  const { isGuest, guestAPI, guestUser } = useGuestMode();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isGuest) {
        const entityAPI = guestAPI[entity];
        if (filter) {
          return entityAPI.filter({ ...filter, user_id: guestUser.id });
        }
        return entityAPI[operation]();
      } else {
        const user = await base44.auth.me();
        const entityName = entity.charAt(0).toUpperCase() + entity.slice(1).replace(/([A-Z])/g, match => match);
        
        if (filter) {
          return base44.entities[entityName].filter({ ...filter, user_id: user.id });
        }
        return base44.entities[entityName][operation]();
      }
    },
    enabled,
  });
};

export const useGuestSafeUser = () => {
  const { isGuest, guestUser } = useGuestMode();
  
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (isGuest) {
        return guestUser;
      }
      return base44.auth.me();
    },
  });
};