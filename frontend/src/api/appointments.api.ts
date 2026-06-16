import { axiosClient, request } from "./axiosClient";
import type { Appointment, AppointmentPayload, RescheduleAppointmentPayload, AppointmentStatus } from "../types/appointment";
import type { EntityId, ListResponse, QueryParams } from "../types/common";

export const appointmentsApi = {
  list(params?: QueryParams) {
    return request<ListResponse<Appointment>>(axiosClient.get("/api/appointments/", { params }));
  },
  detail(id: EntityId) {
    return request<Appointment>(axiosClient.get(`/api/appointments/${id}/`));
  },
  create(payload: AppointmentPayload) {
    return request<Appointment>(axiosClient.post("/api/appointments/", payload));
  },
  confirm(id: EntityId) {
    return request<Appointment>(axiosClient.post(`/api/appointments/${id}/confirm/`));
  },
  arrive(id: EntityId) {
    return request<Appointment>(axiosClient.post(`/api/appointments/${id}/arrive/`));
  },
  cancel(id: EntityId, reason?: string) {
    return request<Appointment>(axiosClient.post(`/api/appointments/${id}/cancel/`, { reason }));
  },
  reschedule(id: EntityId, payload: RescheduleAppointmentPayload) {
    return request<Appointment>(axiosClient.post(`/api/appointments/${id}/reschedule/`, payload));
  },
  update(id: EntityId, payload: Partial<AppointmentPayload | { status: AppointmentStatus }>) {
    return request<Appointment>(axiosClient.patch(`/api/appointments/${id}/`, payload));
  },
  availability(params?: QueryParams) {
    return request<{ message: string }>(axiosClient.get("/api/appointments/availability/", { params }));
  },
};

