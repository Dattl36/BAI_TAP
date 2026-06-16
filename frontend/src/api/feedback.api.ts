import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Feedback } from "../types/feedback";

export const feedbackApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Feedback>>(axiosClient.get("/api/feedback/", { params }));
  },
  detail(id: EntityId) {
    return request<Feedback>(axiosClient.get(`/api/feedback/${id}/`));
  },
  create(payload: Partial<Feedback>) {
    return request<Feedback>(axiosClient.post("/api/feedback/", payload));
  },
  respond(id: EntityId, response: string) {
    return request<Feedback>(axiosClient.post(`/api/feedback/${id}/respond/`, { response }));
  },
  close(id: EntityId) {
    return request<Feedback>(axiosClient.post(`/api/feedback/${id}/close/`));
  },
};
