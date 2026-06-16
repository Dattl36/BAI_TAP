import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import type { Role } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { usePermission } from "../../hooks/usePermission";
import { PageLoading } from "./PageLoading";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { allowed, role } = usePermission(allowedRoles);

  if (!role) {
    return <PageLoading />;
  }

  if (!allowed) {
    return <Navigate to={ROUTES.forbidden} replace />;
  }

  return <>{children}</>;
};
