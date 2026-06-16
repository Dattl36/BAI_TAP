export const ROLES = {
  CUSTOMER: "customer",
  RECEPTIONIST: "receptionist",
  STAFF: "staff",
  MANAGER: "manager",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  receptionist: "Receptionist",
  staff: "Staff",
  manager: "Manager",
};
