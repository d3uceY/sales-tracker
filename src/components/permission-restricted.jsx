import { usePermissions } from '@/context/permissions-context';
import AccessDenied from '@/pages/access-denied';

export default function PermissionRestricted({ children, requiredRole, requiredPermission = 'read' }) {
  const { loading, error, canRead, canCreate, canUpdate, canDelete, isAdmin, hasRole, isSuperAdmin } = usePermissions();

  if (loading) return null;
  if (error) return <AccessDenied />;

  // Super Admin bypasses all restrictions
  if (isSuperAdmin) {
    return children;
  }

  // Check for required role (if provided)
  if (requiredRole && !hasRole(requiredRole) && !isAdmin()) {
    return <AccessDenied />;
  }

  // Check for required permission
  let allowed = false;
  if (requiredPermission === 'read') allowed = canRead();
  if (requiredPermission === 'create') allowed = canCreate();
  if (requiredPermission === 'update') allowed = canUpdate();
  if (requiredPermission === 'delete') allowed = canDelete();

  if (!allowed) return <AccessDenied />;

  return children;
}