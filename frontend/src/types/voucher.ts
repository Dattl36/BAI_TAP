import type { BaseEntity, EntityId } from "./common";

export interface Voucher extends BaseEntity {
  code: string;
  customer?: EntityId | null;
  discount_type: "amount" | "percent";
  discount_value: string | number;
  min_invoice: string | number;
  usage_limit: number;
  used_count: number;
  starts_at: string;
  expires_at: string;
  status: "active" | "redeemed" | "expired" | "cancelled";
  title?: string;
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  quantity?: number;
  is_active?: boolean;
}
