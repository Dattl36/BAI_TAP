import type { BaseEntity, EntityId } from "./common";

export type PaymentStatus =
  | "attempted"
  | "pending"
  | "successful"
  | "failed"
  | "cancelled"
  | "refunded"
  | "adjusted";

export interface Payment extends BaseEntity {
  invoice: EntityId;
  customer: EntityId;
  amount: string | number;
  method: string;
  reference_code?: string;
  status: PaymentStatus;
  processed_at?: string | null;
  failure_reason?: string;
}

export interface PaymentPayload {
  invoice: EntityId;
  amount: string | number;
  method: string;
  reference_code?: string;
}
