import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../../api/reports.api";
import { appointmentsApi } from "../../api/appointments.api";
import { customersApi } from "../../api/customers.api";
import { employeesApi } from "../../api/employees.api";
import { invoicesApi } from "../../api/invoices.api";
import { queryKeys } from "../../constants/queryKeys";
import {
  normalizeRevenueReport,
  normalizeAppointmentReport,
  normalizeServiceReport,
  normalizeStaffPerformanceReport,
} from "../../utils/reportAdapters";
import { normalizePaginatedResponse } from "../../utils/apiResponse";

export const useManagerDashboardData = (params?: { start?: string; end?: string }) => {
  const revenueQuery = useQuery({
    queryKey: queryKeys.reports.revenue(params as Record<string, string>),
    queryFn: () => reportsApi.revenue(params),
  });

  const appointmentsReportQuery = useQuery({
    queryKey: queryKeys.reports.appointments(params as Record<string, string>),
    queryFn: () => reportsApi.appointments(params),
  });

  const customersQuery = useQuery({
    queryKey: queryKeys.customers.list(),
    queryFn: () => customersApi.list(),
  });

  const employeesQuery = useQuery({
    queryKey: queryKeys.employees.list(),
    queryFn: () => employeesApi.list(),
  });

  const recentAppointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.list(),
    queryFn: () => appointmentsApi.list({ limit: 100, ordering: "-scheduled_start" }),
  });

  const invoicesQuery = useQuery({
    queryKey: queryKeys.invoices.list(),
    queryFn: () => invoicesApi.list({ limit: 100 }),
  });

  const servicesReportQuery = useQuery({
    queryKey: queryKeys.reports.services(params as Record<string, string>),
    queryFn: () => reportsApi.services(params),
  });

  const staffPerformanceQuery = useQuery({
    queryKey: queryKeys.reports.staffPerformance(params as Record<string, string>),
    queryFn: () => reportsApi.staffPerformance(params),
  });

  const isLoading =
    revenueQuery.isLoading ||
    appointmentsReportQuery.isLoading ||
    customersQuery.isLoading ||
    employeesQuery.isLoading ||
    recentAppointmentsQuery.isLoading ||
    invoicesQuery.isLoading ||
    servicesReportQuery.isLoading ||
    staffPerformanceQuery.isLoading;

  const isError =
    revenueQuery.isError ||
    appointmentsReportQuery.isError ||
    customersQuery.isError ||
    employeesQuery.isError ||
    recentAppointmentsQuery.isError ||
    invoicesQuery.isError ||
    servicesReportQuery.isError ||
    staffPerformanceQuery.isError;

  const error =
    revenueQuery.error ||
    appointmentsReportQuery.error ||
    customersQuery.error ||
    employeesQuery.error ||
    recentAppointmentsQuery.error ||
    invoicesQuery.error ||
    servicesReportQuery.error ||
    staffPerformanceQuery.error;

  const normalizedInvoices = normalizePaginatedResponse(invoicesQuery.data ?? []).results;
  const normalizedRecentAppointments = normalizePaginatedResponse(recentAppointmentsQuery.data ?? []).results;
  const normalizedEmployees = normalizePaginatedResponse(employeesQuery.data ?? []).results;

  const revenueReport = normalizeRevenueReport(revenueQuery.data ?? null, normalizedInvoices);
  const appointmentReport = normalizeAppointmentReport(appointmentsReportQuery.data, normalizedRecentAppointments);
  const serviceReport = normalizeServiceReport(servicesReportQuery.data, normalizedRecentAppointments);
  const staffPerformanceReport = normalizeStaffPerformanceReport(staffPerformanceQuery.data ?? null, normalizedEmployees);

  const customerCount = normalizePaginatedResponse(customersQuery.data ?? []).count;
  const employeeCount = normalizedEmployees.length;

  return {
    isLoading,
    isError,
    error,
    revenueReport,
    appointmentReport,
    serviceReport,
    staffPerformanceReport,
    customerCount,
    employeeCount,
    recentAppointments: normalizedRecentAppointments,
    invoices: normalizedInvoices,
    employees: normalizedEmployees,
    refetch: () => {
      void revenueQuery.refetch();
      void appointmentsReportQuery.refetch();
      void customersQuery.refetch();
      void employeesQuery.refetch();
      void recentAppointmentsQuery.refetch();
      void invoicesQuery.refetch();
      void servicesReportQuery.refetch();
      void staffPerformanceQuery.refetch();
    },
  };
};
