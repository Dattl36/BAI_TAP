import type { BaseEntity, EntityId } from "./common";

export interface Notification extends BaseEntity {
  recipient: EntityId;
  category: string;
  title: string;
  message: string;
  delivery_status: "created" | "delivered" | "read" | "failed";
  read_at?: string | null;
}
