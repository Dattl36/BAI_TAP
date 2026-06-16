export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },

  // Dashboard-level keys for role-scoped invalidation
  customerHome: ["customerHome"] as const,
  managerDashboard: ["managerDashboard"] as const,
  receptionistDashboard: ["receptionistDashboard"] as const,
  staffDashboard: ["staffDashboard"] as const,

  accounts: {
    all: ["accounts"] as const,
    list: (params?: unknown) => ["accounts", "list", params] as const,
    detail: (id: number | string) => ["accounts", "detail", id] as const,
  },

  customers: {
    all: ["customers"] as const,
    list: (params?: unknown) => ["customers", "list", params] as const,
    detail: (id: number | string) => ["customers", "detail", id] as const,
  },

  employees: {
    all: ["employees"] as const,
    list: (params?: unknown) => ["employees", "list", params] as const,
    detail: (id: number | string) => ["employees", "detail", id] as const,
  },

  services: {
    all: ["services"] as const,
    list: (params?: unknown) => ["services", "list", params] as const,
    detail: (id: number | string) => ["services", "detail", id] as const,
  },

  appointments: {
    all: ["appointments"] as const,
    list: (params?: unknown) => ["appointments", "list", params] as const,
    detail: (id: number | string) => ["appointments", "detail", id] as const,
  },

  serviceExecutions: {
    all: ["serviceExecutions"] as const,
    list: (params?: unknown) => ["serviceExecutions", "list", params] as const,
    detail: (id: number | string) => ["serviceExecutions", "detail", id] as const,
  },

  invoices: {
    all: ["invoices"] as const,
    list: (params?: unknown) => ["invoices", "list", params] as const,
    detail: (id: number | string) => ["invoices", "detail", id] as const,
  },

  payments: {
    all: ["payments"] as const,
    list: (params?: unknown) => ["payments", "list", params] as const,
    detail: (id: number | string) => ["payments", "detail", id] as const,
  },

  vouchers: {
    all: ["vouchers"] as const,
    list: (params?: unknown) => ["vouchers", "list", params] as const,
  },

  rewards: {
    all: ["rewards"] as const,
    list: (params?: unknown) => ["rewards", "list", params] as const,
    ledger: ["rewards", "ledger"] as const,
  },

  feedback: {
    all: ["feedback"] as const,
    list: (params?: unknown) => ["feedback", "list", params] as const,
  },

  complaints: {
    all: ["complaints"] as const,
    list: (params?: unknown) => ["complaints", "list", params] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    list: (params?: unknown) => ["notifications", "list", params] as const,
  },

  reports: {
    revenue: (params?: unknown) => ["reports", "revenue", params] as const,
    appointments: (params?: unknown) => ["reports", "appointments", params] as const,
    services: (params?: unknown) => ["reports", "services", params] as const,
    customers: (params?: unknown) => ["reports", "customers", params] as const,
    staffPerformance: (params?: unknown) => ["reports", "staffPerformance", params] as const,
  },
};
