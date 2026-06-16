import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Account, AccountPayload } from "../types/account";

export const accountsApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Account>>(axiosClient.get("/api/accounts/", { params }));
  },
  detail(id: EntityId) {
    return request<Account>(axiosClient.get(`/api/accounts/${id}/`));
  },
  create(payload: AccountPayload) {
    return request<Account>(axiosClient.post("/api/accounts/", payload));
  },
  update(id: EntityId, payload: Partial<AccountPayload>) {
    return request<Account>(axiosClient.patch(`/api/accounts/${id}/`, payload));
  },
  deactivate(id: EntityId) {
    return request<Account>(axiosClient.post(`/api/accounts/${id}/deactivate/`));
  },
};
