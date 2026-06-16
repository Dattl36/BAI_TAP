import type { BaseEntity, EntityId } from "./common";

export interface Employee extends BaseEntity {
  user?: EntityId;
  employee_code?: string;
  role_type: "receptionist" | "staff" | "manager";
  full_name: string;
  phone?: string;
  specialties?: string;
  employment_status?: string;
}

export interface StaffAvailability extends BaseEntity {
  employee: EntityId;
  date: string;
  start_time: string;
  end_time: string;
  availability_type: "available" | "unavailable";
  reason?: string;
}
