import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Promotion } from "../types/promotion";

export const promotionsApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Promotion>>(axiosClient.get("/api/promotions/", { params }));
  },
  detail(id: EntityId) {
    return request<Promotion>(axiosClient.get(`/api/promotions/${id}/`));
  },
  create(payload: Partial<Promotion>) {
    return request<Promotion>(axiosClient.post("/api/promotions/", payload));
  },
  update(id: EntityId, payload: Partial<Promotion>) {
    return request<Promotion>(axiosClient.patch(`/api/promotions/${id}/`, payload));
  },
  archive(id: EntityId) {
    return request<Promotion>(axiosClient.post(`/api/promotions/${id}/archive/`));
  },
};
