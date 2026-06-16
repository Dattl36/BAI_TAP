import type { BaseEntity, EntityId } from "./common";

export interface InvoiceItem extends BaseEntity {
  item_type: "service" | "incidental";
  service?: EntityId | null;
  description: string;
  quantity: number;
  unit_price: string | number;
  line_total: string | number;
}

export interface Invoice extends BaseEntity {
  customer: EntityId;
  appointment: EntityId;
  status: "draft" | "issued" | "partially_paid" | "paid" | "adjusted" | "cancelled";
  subtotal: string | number;
  discount_total: string | number;
  reward_discount: string | number;
  total_due: string | number;
  paid_amount: string | number;
  balance_due: string | number;
  issued_at?: string | null;
  items?: InvoiceItem[];
}
