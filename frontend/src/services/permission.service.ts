import type { Role } from "../constants/roles";

export const permissionService = {
  hasRole(userRole: Role | undefined, allowedRoles: Role[]) {
    if (!allowedRoles.length) {
      return true;
    }

    return Boolean(userRole && allowedRoles.includes(userRole));
  },
};
