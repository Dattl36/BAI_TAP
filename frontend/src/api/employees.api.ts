import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Employee, StaffAvailability } from "../types/employee";

export const employeesApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Employee>>(axiosClient.get("/api/employees/", { params }));
  },
  detail(id: EntityId) {
    return request<Employee>(axiosClient.get(`/api/employees/${id}/`));
  },
  create(payload: Partial<Employee>) {
    return request<Employee>(axiosClient.post("/api/employees/", payload));
  },
  update(id: EntityId, payload: Partial<Employee>) {
    return request<Employee>(axiosClient.patch(`/api/employees/${id}/`, payload));
  },
  availability(id: EntityId) {
    return request<ListResponse<StaffAvailability>>(axiosClient.get(`/api/employees/${id}/availability/`));
  },
  listAvailability(params?: QueryParams) {
    return request<ListResponse<StaffAvailability>>(axiosClient.get("/api/employees/availability-blocks/", { params }));
  },
  createAvailability(payload: Partial<StaffAvailability>) {
    return request<StaffAvailability>(axiosClient.post("/api/employees/availability-blocks/", payload));
  },
  updateAvailability(id: EntityId, payload: Partial<StaffAvailability>) {
    return request<StaffAvailability>(axiosClient.patch(`/api/employees/availability-blocks/${id}/`, payload));
  },
  deleteAvailability(id: EntityId) {
    return request<unknown>(axiosClient.delete(`/api/employees/availability-blocks/${id}/`));
  },
};
