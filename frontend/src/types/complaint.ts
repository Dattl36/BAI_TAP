import type { BaseEntity, EntityId } from "./common";

export interface Complaint extends BaseEntity {
  customer: EntityId;
  appointment?: EntityId | null;
  title: string;
  description: string;
  status: "received" | "assigned" | "in_review" | "escalated" | "resolved" | "closed" | "rejected";
  assigned_to?: EntityId | null;
  escalated_to?: EntityId | null;
  resolution?: string;
}
