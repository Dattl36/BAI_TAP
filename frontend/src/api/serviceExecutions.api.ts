import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { ServiceExecution, ServiceIncidental } from "../types/serviceExecution";

export const serviceExecutionsApi = {
  list(params?: QueryParams) {
    return request<ListResponse<ServiceExecution>>(axiosClient.get("/api/service-executions/", { params }));
  },
  detail(id: EntityId) {
    return request<ServiceExecution>(axiosClient.get(`/api/service-executions/${id}/`));
  },
  start(appointmentId: EntityId) {
    return request<ServiceExecution>(axiosClient.post(`/api/service-executions/${appointmentId}/start/`));
  },
  addIncidental(id: EntityId, payload: Partial<ServiceIncidental>) {
    return request<ServiceIncidental>(axiosClient.post(`/api/service-executions/${id}/incidentals/`, payload));
  },
  complete(id: EntityId, result_notes?: string) {
    return request<ServiceExecution>(axiosClient.post(`/api/service-executions/${id}/complete/`, { result_notes }));
  },
};
