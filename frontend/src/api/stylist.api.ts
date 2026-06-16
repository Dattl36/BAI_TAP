import { axiosClient, request } from "./axiosClient";
import { employeesApi } from "./employees.api";
import { appointmentsApi } from "./appointments.api";
import { serviceExecutionsApi } from "./serviceExecutions.api";
import { getListItems } from "../utils/apiResponse";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { Employee, StaffAvailability } from "../types/employee";
import type { Appointment } from "../types/appointment";
import type { ServiceExecution, ServiceIncidental } from "../types/serviceExecution";
import dayjs from "dayjs";

export const stylistApi = {
  /**
   * Fetches the logged-in stylist's profile.
   * Scoped automatically by backend to the current user's employee profile.
   */
  async getMyProfile(): Promise<Employee> {
    const res = await employeesApi.list();
    const items = getListItems(res);
    if (items.length > 0) {
      return items[0];
    }
    throw new Error("Stylist profile not found");
  },

  /**
   * Updates the stylist's profile information.
   */
  updateMyProfile(id: EntityId, payload: Partial<Employee>) {
    return employeesApi.update(id, payload);
  },

  /**
   * Fetches the stylist's scheduled appointments for today.
   */
  getMyTodayAppointments() {
    const today = dayjs().format("YYYY-MM-DD");
    return appointmentsApi.list({ scheduled_date: today, ordering: "scheduled_start" });
  },

  /**
   * Fetches all appointments assigned to the stylist (filterable).
   */
  getMyAssignedBookings(params?: QueryParams) {
    return appointmentsApi.list(params);
  },

  /**
   * Initiates the service execution for an appointment.
   */
  startService(appointmentId: EntityId) {
    return serviceExecutionsApi.start(appointmentId);
  },

  /**
   * Marks a service execution as completed with optional notes.
   */
  completeService(executionId: EntityId, resultNotes?: string) {
    return serviceExecutionsApi.complete(executionId, resultNotes);
  },

  /**
   * Adds an incidental fee (additional service/product) to an active service execution.
   */
  addIncidental(executionId: EntityId, payload: Partial<ServiceIncidental>) {
    return serviceExecutionsApi.addIncidental(executionId, payload);
  },

  /**
   * Fetches the availability/shift slots for the stylist.
   */
  getMyAvailability(employeeId: EntityId) {
    return employeesApi.availability(employeeId);
  },

  /**
   * Adds an availability block or shift.
   */
  addAvailabilityBlock(employeeId: EntityId, payload: Partial<StaffAvailability>) {
    return request<StaffAvailability>(
      axiosClient.post(`/api/employees/${employeeId}/availability/`, payload)
    );
  },

  /**
   * Deletes an availability block.
   */
  deleteAvailabilityBlock(blockId: EntityId) {
    return request<null>(
      axiosClient.delete(`/api/employees/availability-blocks/${blockId}/`)
    );
  },
};
