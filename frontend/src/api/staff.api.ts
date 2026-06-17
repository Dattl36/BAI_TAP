import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Employee } from "../types/employee";
import type { AccountPayload } from "../types/account";

// Staff payload for create/update through manager view
export interface StaffPayload extends Partial<AccountPayload> {
  full_name?: string;
  phone?: string;
  specialties?: string;
  role_type?: string;
  employment_status?: string;
}

export const staffApi = {
  // Try GET /api/employees/ with role filter (excludes customers by default)
  list(params?: QueryParams) {
    return request<ListResponse<Employee>>(axiosClient.get("/api/employees/", { params }));
  },
  detail(id: EntityId) {
    return request<Employee>(axiosClient.get(`/api/employees/${id}/`));
  },
  create(payload: StaffPayload) {
    return request<Employee>(axiosClient.post("/api/employees/", payload));
  },
  update(id: EntityId, payload: StaffPayload) {
    return request<Employee>(axiosClient.patch(`/api/employees/${id}/`, payload));
  },
  // Toggle employment status
  setStatus(id: EntityId, status: "active" | "inactive") {
    return request<Employee>(axiosClient.patch(`/api/employees/${id}/`, { employment_status: status }));
  },
};
