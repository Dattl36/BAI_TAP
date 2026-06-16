import type { BaseEntity, EntityId } from "./common";

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "arrived"
  | "in_service"
  | "completed"
  | "invoiced"
  | "closed"
  | "cancelled"
  | "no_show";

export interface AppointmentServiceItem extends BaseEntity {
  service: EntityId;
  price_at_booking: string | number;
  duration_at_booking: number;
  quantity: number;
}

export interface Appointment extends BaseEntity {
  customer: EntityId;
  staff: EntityId;
  scheduled_start: string;
  scheduled_end: string;
  status: AppointmentStatus;
  source?: "customer" | "receptionist";
  cancellation_reason?: string;
  no_show_reason?: string;
  appointment_services?: AppointmentServiceItem[];
  // Nested serialized details (may be returned by backend)
  service_details?: { name?: string; duration?: number; price?: number } | null;
  employee_details?: { full_name?: string; specialties?: string } | null;
  customer_details?: { full_name?: string; email?: string; phone?: string } | null;
}

export interface AppointmentPayload {
  customer: EntityId;
  staff: EntityId;
  scheduled_start: string;
  scheduled_end: string;
  source?: "customer" | "receptionist";
  appointment_services?: Array<{
    service: EntityId;
    quantity?: number;
  }>;
}

export interface RescheduleAppointmentPayload {
  staff?: EntityId;
  scheduled_start: string;
  scheduled_end: string;
}
