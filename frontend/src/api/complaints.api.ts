import { axiosClient, request } from "./axiosClient";
import type { Complaint } from "../types/complaint";
import type { EntityId, ListResponse, QueryParams } from "../types/common";

export const complaintsApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Complaint>>(axiosClient.get("/api/complaints/", { params }));
  },
  detail(id: EntityId) {
    return request<Complaint>(axiosClient.get(`/api/complaints/${id}/`));
  },
  create(payload: Partial<Complaint>) {
    return request<Complaint>(axiosClient.post("/api/complaints/", payload));
  },
  assign(id: EntityId, assignee: EntityId, note?: string) {
    return request<Complaint>(axiosClient.post(`/api/complaints/${id}/assign/`, { assignee, note }));
  },
  escalate(id: EntityId, manager: EntityId, note?: string) {
    return request<Complaint>(axiosClient.post(`/api/complaints/${id}/escalate/`, { manager, note }));
  },
  resolve(id: EntityId, resolution: string) {
    return request<Complaint>(axiosClient.post(`/api/complaints/${id}/resolve/`, { resolution }));
  },
  close(id: EntityId, note?: string) {
    return request<Complaint>(axiosClient.post(`/api/complaints/${id}/close/`, { note }));
  },
  history(id: EntityId) {
    return request<unknown>(axiosClient.get(`/api/complaints/${id}/history/`));
  },
};
