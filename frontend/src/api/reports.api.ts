import { axiosClient, request } from "./axiosClient";
import type {
  AppointmentSummary,
  ReportPeriodParams,
  RevenueSummary,
  StaffPerformanceSummary,
} from "../types/report";

export const reportsApi = {
  revenue(params?: ReportPeriodParams) {
    return request<RevenueSummary>(axiosClient.get("/api/reports/revenue/", { params }));
  },
  appointments(params?: ReportPeriodParams) {
    return request<AppointmentSummary>(axiosClient.get("/api/reports/appointments/", { params }));
  },
  services(params?: ReportPeriodParams) {
    return request<unknown>(axiosClient.get("/api/reports/services/", { params }));
  },
  customers(params?: ReportPeriodParams) {
    return request<unknown>(axiosClient.get("/api/reports/customers/", { params }));
  },
  staffPerformance(params?: ReportPeriodParams) {
    return request<StaffPerformanceSummary[]>(axiosClient.get("/api/reports/staff-performance/", { params }));
  },
};
