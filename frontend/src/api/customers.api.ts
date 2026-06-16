import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Customer, CustomerPayload } from "../types/customer";

export const customersApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Customer>>(axiosClient.get("/api/customers/", { params }));
  },
  detail(id: EntityId) {
    return request<Customer>(axiosClient.get(`/api/customers/${id}/`));
  },
  create(payload: CustomerPayload) {
    return request<Customer>(axiosClient.post("/api/customers/", payload));
  },
  update(id: EntityId, payload: Partial<CustomerPayload>) {
    return request<Customer>(axiosClient.patch(`/api/customers/${id}/`, payload));
  },
  history(id: EntityId) {
    return request<unknown>(axiosClient.get(`/api/customers/${id}/history/`));
  },
};
