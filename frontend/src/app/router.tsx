import { Navigate, createBrowserRouter, Outlet } from "react-router-dom";

import { ROUTES } from "../constants/routes";
import { tokenService } from "../services/token.service";
import { ROLES } from "../constants/roles";

// Layouts
import { AuthLayout } from "../layouts/AuthLayout";
import { CustomerLayout } from "../layouts/customer/CustomerLayout";
import { ReceptionistLayout } from "../layouts/receptionist/ReceptionistLayout";
import { StaffLayout } from "../layouts/staff/StaffLayout";
import { ManagerLayout } from "../layouts/manager/ManagerLayout";
import { PublicLayout } from "../layouts/PublicLayout";

// Public Pages
import { PublicHomePage } from "../pages/public/PublicHomePage";
import { PublicServiceListPage } from "../pages/public/PublicServiceListPage";
import { PublicServiceDetailPage } from "../pages/public/PublicServiceDetailPage";
import { PublicPromotionPage } from "../pages/public/PublicPromotionPage";
import { PublicStylistListPage } from "../pages/public/PublicStylistListPage";
import { PublicAboutPage } from "../pages/public/PublicAboutPage";
import { PublicContactPage } from "../pages/public/PublicContactPage";
import { PublicBookingPreviewPage } from "../pages/public/PublicBookingPreviewPage";

// Guards & Common
import { RoleGuard } from "../components/common/RoleGuard";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForbiddenPage } from "../pages/errors/ForbiddenPage";
import { NotFoundPage } from "../pages/errors/NotFoundPage";
import { DashboardRedirect } from "../pages/dashboard/DashboardRedirect";

// Customer Pages
import { CustomerHomePage } from "../pages/customer/CustomerHomePage";
import { CustomerBookingPage } from "../pages/customer/CustomerBookingPage";
import { CustomerAppointmentsPage } from "../pages/customer/CustomerAppointmentsPage";
import { CustomerAppointmentDetailPage } from "../pages/customer/CustomerAppointmentDetailPage";
import { CustomerInvoicesPage } from "../pages/customer/CustomerInvoicesPage";
import { CustomerRewardsPage } from "../pages/customer/CustomerRewardsPage";
import { CustomerVouchersPage } from "../pages/customer/CustomerVouchersPage";
import { CustomerFeedbackPage } from "../pages/customer/CustomerFeedbackPage";
import { CustomerComplaintsPage } from "../pages/customer/CustomerComplaintsPage";
import { CustomerNotificationsPage } from "../pages/customer/CustomerNotificationsPage";
import { CustomerProfilePage } from "../pages/customer/CustomerProfilePage";

// Receptionist Pages
import { ReceptionistHomePage } from "../pages/receptionist/ReceptionistHomePage";
import { ReceptionistTodayAppointmentsPage } from "../pages/receptionist/ReceptionistTodayAppointmentsPage";
import { ReceptionistCalendarPage } from "../pages/receptionist/ReceptionistCalendarPage";
import { ReceptionistCreateAppointmentPage } from "../pages/receptionist/ReceptionistCreateAppointmentPage";
import { ReceptionistCustomersPage } from "../pages/receptionist/ReceptionistCustomersPage";
import { ReceptionistCustomerDetailPage } from "../pages/receptionist/ReceptionistCustomerDetailPage";
import { ReceptionistInvoicesPage } from "../pages/receptionist/ReceptionistInvoicesPage";
import { ReceptionistInvoiceDetailPage } from "../pages/receptionist/ReceptionistInvoiceDetailPage";
import { ReceptionistPaymentsPage } from "../pages/receptionist/ReceptionistPaymentsPage";
import { ReceptionistFeedbackPage } from "../pages/receptionist/ReceptionistFeedbackPage";
import { ReceptionistComplaintsPage } from "../pages/receptionist/ReceptionistComplaintsPage";
import { ReceptionistNotificationsPage } from "../pages/receptionist/ReceptionistNotificationsPage";

// Staff Pages
import { StaffHomePage } from "../pages/staff/StaffHomePage";
import { StaffSchedulePage } from "../pages/staff/StaffSchedulePage";
import { StaffAssignedAppointmentsPage } from "../pages/staff/StaffAssignedAppointmentsPage";
import { StaffAppointmentDetailPage } from "../pages/staff/StaffAppointmentDetailPage";
import { StaffServiceExecutionPage } from "../pages/staff/StaffServiceExecutionPage";
import { StaffIncidentalsPage } from "../pages/staff/StaffIncidentalsPage";
import { StaffAvailabilityPage } from "../pages/staff/StaffAvailabilityPage";
import { StaffNotificationsPage } from "../pages/staff/StaffNotificationsPage";
import { StaffProfilePage } from "../pages/staff/StaffProfilePage";

// Manager Pages
import { ManagerHomePage } from "../pages/manager/ManagerHomePage";
import { ManagerReportsPage } from "../pages/manager/ManagerReportsPage";
import { ManagerRevenueReportPage } from "../pages/manager/ManagerRevenueReportPage";
import { ManagerAppointmentReportPage } from "../pages/manager/ManagerAppointmentReportPage";
import { ManagerServiceReportPage } from "../pages/manager/ManagerServiceReportPage";
import { ManagerCustomerReportPage } from "../pages/manager/ManagerCustomerReportPage";
import { ManagerStaffPerformanceReportPage } from "../pages/manager/ManagerStaffPerformanceReportPage";
import { ManagerAccountsPage } from "../pages/manager/ManagerAccountsPage";
import { ManagerEmployeesPage } from "../pages/manager/ManagerEmployeesPage";
import { ManagerServicesPage } from "../pages/manager/ManagerServicesPage";
import { ManagerPromotionsPage } from "../pages/manager/ManagerPromotionsPage";
import { ManagerVouchersPage } from "../pages/manager/ManagerVouchersPage";
import { ManagerCustomersPage } from "../pages/manager/ManagerCustomersPage";
import { ManagerNotificationsPage } from "../pages/manager/ManagerNotificationsPage";
import { ManagerInvoicesPage } from "../pages/manager/ManagerInvoicesPage";
import { ManagerSchedulingPage } from "../pages/manager/ManagerSchedulingPage";
import { ManagerAppointmentsPage } from "../pages/manager/ManagerAppointmentsPage";
import { ManagerSettingsPage } from "../pages/manager/ManagerSettingsPage";

// Core auth guard wrapper
const ProtectedRoute = () =>
  tokenService.getAccessToken() ? <Outlet /> : <Navigate to={ROUTES.login} replace />;

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
    ],
  },
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <PublicHomePage /> },
      { path: "services", element: <PublicServiceListPage /> },
      { path: "services/:id", element: <PublicServiceDetailPage /> },
      { path: "promotions", element: <PublicPromotionPage /> },
      { path: "stylists", element: <PublicStylistListPage /> },
      { path: "about", element: <PublicAboutPage /> },
      { path: "contact", element: <PublicContactPage /> },
      { path: "booking-preview", element: <PublicBookingPreviewPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      // Generic dashboard redirects to dynamic role hubs
      { path: "dashboard", element: <DashboardRedirect /> },

      // ==========================================
      // CUSTOMER PORTAL WORKSPACE
      // ==========================================
      {
        path: "customer",
        element: (
          <RoleGuard allowedRoles={[ROLES.CUSTOMER]}>
            <CustomerLayout />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <CustomerHomePage /> },
          { path: "book", element: <CustomerBookingPage /> },
          { path: "appointments", element: <CustomerAppointmentsPage /> },
          { path: "appointments/:id", element: <CustomerAppointmentDetailPage /> },
          { path: "invoices", element: <CustomerInvoicesPage /> },
          { path: "rewards", element: <CustomerRewardsPage /> },
          { path: "vouchers", element: <CustomerVouchersPage /> },
          { path: "feedback", element: <CustomerFeedbackPage /> },
          { path: "complaints", element: <CustomerComplaintsPage /> },
          { path: "notifications", element: <CustomerNotificationsPage /> },
          { path: "profile", element: <CustomerProfilePage /> },
        ],
      },

      // ==========================================
      // RECEPTIONIST DESK WORKSPACE
      // ==========================================
      {
        path: "receptionist",
        element: (
          <RoleGuard allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionistLayout />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <ReceptionistHomePage /> },
          { path: "today", element: <ReceptionistTodayAppointmentsPage /> },
          { path: "calendar", element: <ReceptionistCalendarPage /> },
          { path: "appointments/create", element: <ReceptionistCreateAppointmentPage /> },
          { path: "customers", element: <ReceptionistCustomersPage /> },
          { path: "customers/:id", element: <ReceptionistCustomerDetailPage /> },
          { path: "invoices", element: <ReceptionistInvoicesPage /> },
          { path: "invoices/:id", element: <ReceptionistInvoiceDetailPage /> },
          { path: "payments", element: <ReceptionistPaymentsPage /> },
          { path: "feedback", element: <ReceptionistFeedbackPage /> },
          { path: "complaints", element: <ReceptionistComplaintsPage /> },
          { path: "notifications", element: <ReceptionistNotificationsPage /> },
        ],
      },

      // ==========================================
      // STAFF WORKBENCH WORKSPACE
      // ==========================================
      {
        path: "staff",
        element: (
          <RoleGuard allowedRoles={[ROLES.STAFF]}>
            <StaffLayout />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <StaffHomePage /> },
          { path: "schedule", element: <StaffSchedulePage /> },
          { path: "appointments", element: <StaffAssignedAppointmentsPage /> },
          { path: "appointments/:id", element: <StaffAppointmentDetailPage /> },
          { path: "executions/:id", element: <StaffServiceExecutionPage /> },
          { path: "availability", element: <StaffAvailabilityPage /> },
          { path: "notifications", element: <StaffNotificationsPage /> },
          { path: "profile", element: <StaffProfilePage /> },
        ],
      },

      // ==========================================
      // MANAGER EXECUTIVE WORKSPACE
      // ==========================================
      {
        path: "manager",
        element: (
          <RoleGuard allowedRoles={[ROLES.MANAGER]}>
            <ManagerLayout />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <ManagerHomePage /> },
          { path: "reports", element: <ManagerReportsPage /> },
          { path: "reports/revenue", element: <ManagerRevenueReportPage /> },
          { path: "reports/appointments", element: <ManagerAppointmentReportPage /> },
          { path: "reports/services", element: <ManagerServiceReportPage /> },
          { path: "reports/customers", element: <ManagerCustomerReportPage /> },
          { path: "reports/staff-performance", element: <ManagerStaffPerformanceReportPage /> },
          { path: "accounts", element: <ManagerAccountsPage /> },
          { path: "employees", element: <ManagerEmployeesPage /> },
          { path: "services", element: <ManagerServicesPage /> },
          { path: "promotions", element: <ManagerPromotionsPage /> },
          { path: "vouchers", element: <ManagerVouchersPage /> },
          { path: "customers", element: <ManagerCustomersPage /> },
          { path: "notifications", element: <ManagerNotificationsPage /> },
          { path: "invoices", element: <ManagerInvoicesPage /> },
          { path: "scheduling", element: <ManagerSchedulingPage /> },
          { path: "appointments", element: <ManagerAppointmentsPage /> },
          { path: "settings", element: <ManagerSettingsPage /> },
        ],
      },
    ],
  },
  { path: ROUTES.forbidden, element: <ForbiddenPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
