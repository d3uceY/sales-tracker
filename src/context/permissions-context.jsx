import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './auth-context';

const PermissionsContext = createContext();

export function PermissionsProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const roles = user?.roles || [];
  const isSuperAdmin = roles.includes('Super Admin');

  const permissions = useMemo(() => {
    if (isSuperAdmin) {
      return {
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
      };
    }
    // Map backend permission names (read, create) to frontend (canRead, canCreate)
    const userPerms = user?.permissions || {};
    return {
      canRead: userPerms.read,
      canCreate: userPerms.create,
      canUpdate: userPerms.update,
      canDelete: userPerms.delete,
    };
  }, [user, isSuperAdmin]);

  useEffect(() => {
    if (isAuthenticated !== null) {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const canRead = (section) => !!permissions.canRead;
  const canCreate = (section) => !!permissions.canCreate;
  const canUpdate = (section) => !!permissions.canUpdate;
  const canDelete = (section) => !!permissions.canDelete;

  const hasRole = (roleCheck) => {
    return roles.includes(roleCheck);
  };

  const isAdmin = () => {
    return isSuperAdmin || roles.includes('Admin');
  };

  const roleName = roles[0] || '';

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        roles,
        roleName,
        loading,
        error,
        canRead,
        canCreate,
        canUpdate,
        canDelete,
        hasRole,
        isAdmin,
        isSuperAdmin, // Pass boolean directly
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}