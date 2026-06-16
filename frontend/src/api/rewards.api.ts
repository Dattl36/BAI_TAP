import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { RewardLedgerEntry } from "../types/reward";

export const rewardsApi = {
  list(params?: QueryParams) {
    return request<ListResponse<RewardLedgerEntry>>(axiosClient.get("/api/reward-ledger/", { params }));
  },
  adjust(customer: EntityId, points: number, reason?: string) {
    return request<RewardLedgerEntry>(axiosClient.post("/api/reward-ledger/adjust/", { customer, points, reason }));
  },
};
