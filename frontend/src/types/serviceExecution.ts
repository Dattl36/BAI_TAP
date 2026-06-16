import type { BaseEntity, EntityId } from "./common";

export interface ServiceIncidental extends BaseEntity {
  item_type?: "service" | "product" | "other";
  description: string;
  quantity: number;
  unit_price: string | number;
  line_total?: string | number;
}


export interface ServiceExecution extends BaseEntity {
  appointment: EntityId;
  staff: EntityId;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  started_at?: string | null;
  completed_at?: string | null;
  result_notes?: string;
  incidentals?: ServiceIncidental[];
}
