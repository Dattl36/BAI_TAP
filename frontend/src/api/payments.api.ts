import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Payment, PaymentPayload } from "../types/payment";

export const paymentsApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Payment>>(axiosClient.get("/api/payments/", { params }));
  },
  detail(id: EntityId) {
    return request<Payment>(axiosClient.get(`/api/payments/${id}/`));
  },
  create(payload: PaymentPayload) {
    return request<Payment>(axiosClient.post("/api/payments/", payload));
  },
  markSuccess(id: EntityId) {
    return request<Payment>(axiosClient.post(`/api/payments/${id}/mark-success/`));
  },
  markFailed(id: EntityId, reason?: string) {
    return request<Payment>(axiosClient.post(`/api/payments/${id}/mark-failed/`, { reason }));
  },
  refund(id: EntityId, reason?: string) {
    return request<Payment>(axiosClient.post(`/api/payments/${id}/refund/`, { reason }));
  },
  history(id: EntityId) {
    return request<unknown>(axiosClient.get(`/api/payments/${id}/history/`));
  },
};
