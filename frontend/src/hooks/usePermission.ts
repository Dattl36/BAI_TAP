import type { Role } from "../constants/roles";
import { permissionService } from "../services/permission.service";
import { useMe } from "./useMe";

export const usePermission = (allowedRoles: Role[] = []) => {
  const { data: user } = useMe();

  return {
    role: user?.role,
    allowed: permissionService.hasRole(user?.role, allowedRoles),
  };
};
