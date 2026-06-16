export interface ReportPeriodParams {
  start?: string;
  end?: string;
}

export interface RevenueSummary {
  total_revenue: string | number;
  invoice_count: number;
}

export interface AppointmentSummary {
  [status: string]: number | string;
}

export interface StaffPerformanceSummary {
  staff__full_name: string;
  completed: number;
}
