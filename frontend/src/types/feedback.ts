import type { BaseEntity, EntityId } from "./common";

export interface Feedback extends BaseEntity {
  customer: EntityId;
  appointment?: EntityId | null;
  rating?: number;
  comment?: string;
  response?: string;
  status?: "received" | "responded" | "closed";
}
