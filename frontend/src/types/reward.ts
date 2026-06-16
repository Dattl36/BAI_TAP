import type { BaseEntity, EntityId } from "./common";

export interface RewardLedgerEntry extends BaseEntity {
  customer: EntityId;
  invoice?: EntityId | null;
  movement_type: "earn" | "redeem" | "reverse" | "adjust";
  points: number;
  balance_after: number;
  reason?: string;
}
