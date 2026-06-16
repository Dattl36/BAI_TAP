import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Voucher } from "../types/voucher";

export const vouchersApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Voucher>>(axiosClient.get("/api/vouchers/", { params }));
  },
  detail(id: EntityId) {
    return request<Voucher>(axiosClient.get(`/api/vouchers/${id}/`));
  },
  create(payload: Partial<Voucher>) {
    return request<Voucher>(axiosClient.post("/api/vouchers/", payload));
  },
  update(id: EntityId, payload: Partial<Voucher>) {
    return request<Voucher>(axiosClient.patch(`/api/vouchers/${id}/`, payload));
  },
  cancel(id: EntityId) {
    return request<Voucher>(axiosClient.post(`/api/vouchers/${id}/cancel/`));
  },
};
