import { useMemo } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const usePermissions = () => {
  const { profile } = useAuth();

  return useMemo(() => {
    const role = profile?.role || 'tecnico';
    const isAdmin = role === 'admin';

    return {
      role,
      isAdmin,
      canDelete: isAdmin,
      canViewStats: isAdmin,
      canViewCosts: isAdmin,
      canManageUsers: isAdmin,
      canManageClients: isAdmin,
    };
  }, [profile?.role]);
};

export default usePermissions;
