import type { BaseEntity } from "./common";

export interface Promotion extends BaseEntity {
  name: string;
  description?: string;
  discount_type?: "amount" | "percent";
  discount_value?: string | number;
  starts_at?: string;
  expires_at?: string;
  active?: boolean;
}
