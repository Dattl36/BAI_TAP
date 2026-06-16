import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { SalonService, ServicePayload, ServicePriceHistory } from "../types/service";

export const servicesApi = {
  list(params?: QueryParams) {
    return request<ListResponse<SalonService>>(axiosClient.get("/api/services/", { params }));
  },
  detail(id: EntityId) {
    return request<SalonService>(axiosClient.get(`/api/services/${id}/`));
  },
  create(payload: ServicePayload) {
    return request<SalonService>(axiosClient.post("/api/services/", payload));
  },
  update(id: EntityId, payload: Partial<ServicePayload>) {
    return request<SalonService>(axiosClient.patch(`/api/services/${id}/`, payload));
  },
  priceHistory(id: EntityId) {
    return request<ListResponse<ServicePriceHistory>>(axiosClient.get(`/api/services/${id}/price-history/`));
  },
};
