import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Invoice } from "../types/invoice";

export const invoicesApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Invoice>>(axiosClient.get("/api/invoices/", { params }));
  },
  detail(id: EntityId) {
    return request<Invoice>(axiosClient.get(`/api/invoices/${id}/`));
  },
  createFromAppointment(appointmentId: EntityId) {
    return request<Invoice>(axiosClient.post(`/api/invoices/from-appointment/${appointmentId}/`));
  },
  issue(id: EntityId) {
    return request<Invoice>(axiosClient.post(`/api/invoices/${id}/issue/`));
  },
  applyVoucher(id: EntityId, voucher_code: string) {
    return request<Invoice>(axiosClient.post(`/api/invoices/${id}/apply-voucher/`, { voucher_code }));
  },
  useRewardPoints(id: EntityId, points: number) {
    return request<Invoice>(axiosClient.post(`/api/invoices/${id}/use-reward-points/`, { points }));
  },
  adjust(id: EntityId, amount: string | number, reason?: string) {
    return request<Invoice>(axiosClient.post(`/api/invoices/${id}/adjust/`, { amount, reason }));
  },
};
