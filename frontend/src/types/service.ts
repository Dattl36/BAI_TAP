import type { BaseEntity } from "./common";

export interface SalonService extends BaseEntity {
  name: string;
  category?: string;
  description?: string;
  base_price: string | number;
  duration_minutes: number;
  active?: boolean;
  status?: string;
}

export interface ServicePayload {
  name: string;
  category?: string;
  description?: string;
  base_price: string | number;
  duration_minutes: number;
  active?: boolean;
  status?: string;
}

export interface ServicePriceHistory extends BaseEntity {
  old_price: string | number;
  new_price: string | number;
  old_duration: number;
  new_duration: number;
  changed_at?: string;
  reason?: string;
}
