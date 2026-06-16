import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Notification } from "../types/notification";

export const notificationsApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Notification>>(axiosClient.get("/api/notifications/", { params }));
  },
  detail(id: EntityId) {
    return request<Notification>(axiosClient.get(`/api/notifications/${id}/`));
  },
  markRead(id: EntityId) {
    return request<Notification>(axiosClient.post(`/api/notifications/${id}/mark-read/`));
  },
  markAllRead() {
    return request<{ updated?: number }>(axiosClient.post("/api/notifications/mark-all-read/"));
  },
  create(payload: Partial<Notification>) {
    return request<Notification>(axiosClient.post("/api/notifications/", payload));
  },
};
