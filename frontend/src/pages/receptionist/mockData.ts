/**
 * Mock data for the Receptionist Operation Center.
 * Provides realistic demo data for all dashboard sections.
 * Each function returns typed data matching the real API response shapes.
 * Replace function bodies with real API calls when backend is ready.
 */
import dayjs from "dayjs";
import type { Appointment } from "../../types/appointment";

const today = dayjs().format("YYYY-MM-DD");

/* ── Staff on duty ── */
export interface StaffOnDuty {
  id: number;
  name: string;
  specialty: string;
  status: "available" | "busy" | "on-break" | "off";
  currentTask?: string;
}

export const mockStaffOnDuty: StaffOnDuty[] = [
  { id: 1, name: "Elena Mitchell", specialty: "Senior Stylist", status: "busy", currentTask: "Serving Anna V. — Balayage" },
  { id: 2, name: "Marcus Vance", specialty: "Therapist", status: "available" },
  { id: 3, name: "Clara Reynolds", specialty: "Nail Specialist", status: "busy", currentTask: "Serving Lily M. — Gel Nails" },
  { id: 4, name: "David Chen", specialty: "Barber", status: "on-break" },
  { id: 5, name: "Sophie Laurent", specialty: "Colorist", status: "available" },
];

/* ── Services ── */
export interface MockService {
  id: number;
  name: string;
  price: number;
  duration: number;
  category: string;
}

export const mockServices: MockService[] = [
  { id: 1, name: "Luxury Hair Cut & Styling", price: 80, duration: 45, category: "Hair" },
  { id: 2, name: "Balayage & Color Treatment", price: 180, duration: 120, category: "Hair" },
  { id: 3, name: "Deep Hydration Spa Facial", price: 120, duration: 60, category: "Spa" },
  { id: 4, name: "Aromatherapy Full Body Massage", price: 150, duration: 90, category: "Spa" },
  { id: 5, name: "Premium Gel Nail Art", price: 65, duration: 50, category: "Nails" },
  { id: 6, name: "Keratin Smoothing Treatment", price: 200, duration: 150, category: "Hair" },
  { id: 7, name: "Express Blowout", price: 45, duration: 30, category: "Hair" },
  { id: 8, name: "Lash Extension Set", price: 90, duration: 75, category: "Beauty" },
];

/* ── Today's appointments (mock) ── */
export const mockTodayAppointments: Appointment[] = [
  {
    id: 101, customer: 1, staff: 1,
    scheduled_start: `${today}T09:00:00`, scheduled_end: `${today}T11:00:00`,
    status: "in_service", source: "customer",
    customer_details: { full_name: "Anna Verhoeven", phone: "0912-345-678" },
    employee_details: { full_name: "Elena Mitchell", specialties: "Senior Stylist" },
    service_details: { name: "Balayage & Color Treatment", price: 180, duration: 120 },
  },
  {
    id: 102, customer: 2, staff: 3,
    scheduled_start: `${today}T09:30:00`, scheduled_end: `${today}T10:20:00`,
    status: "in_service", source: "receptionist",
    customer_details: { full_name: "Lily Morgan", phone: "0987-654-321" },
    employee_details: { full_name: "Clara Reynolds", specialties: "Nail Specialist" },
    service_details: { name: "Premium Gel Nail Art", price: 65, duration: 50 },
  },
  {
    id: 103, customer: 3, staff: 2,
    scheduled_start: `${today}T10:00:00`, scheduled_end: `${today}T10:45:00`,
    status: "arrived",
    customer_details: { full_name: "Charlotte York", phone: "0901-222-333" },
    employee_details: { full_name: "Marcus Vance", specialties: "Therapist" },
    service_details: { name: "Luxury Hair Cut & Styling", price: 80, duration: 45 },
  },
  {
    id: 104, customer: 4, staff: 5,
    scheduled_start: `${today}T10:30:00`, scheduled_end: `${today}T12:00:00`,
    status: "confirmed",
    customer_details: { full_name: "James Patterson", phone: "0933-444-555" },
    employee_details: { full_name: "Sophie Laurent", specialties: "Colorist" },
    service_details: { name: "Keratin Smoothing Treatment", price: 200, duration: 150 },
  },
  {
    id: 105, customer: 5, staff: 2,
    scheduled_start: `${today}T11:00:00`, scheduled_end: `${today}T12:30:00`,
    status: "requested",
    customer_details: { full_name: "Sophia Lauren", phone: "0977-888-999" },
    employee_details: { full_name: "Marcus Vance", specialties: "Therapist" },
    service_details: { name: "Aromatherapy Full Body Massage", price: 150, duration: 90 },
  },
  {
    id: 106, customer: 6, staff: 1,
    scheduled_start: `${today}T08:00:00`, scheduled_end: `${today}T08:45:00`,
    status: "completed",
    customer_details: { full_name: "Rachel Green", phone: "0911-111-222" },
    employee_details: { full_name: "Elena Mitchell", specialties: "Senior Stylist" },
    service_details: { name: "Express Blowout", price: 45, duration: 30 },
  },
  {
    id: 107, customer: 7, staff: 4,
    scheduled_start: `${today}T08:30:00`, scheduled_end: `${today}T09:15:00`,
    status: "invoiced",
    customer_details: { full_name: "Monica Geller", phone: "0922-333-444" },
    employee_details: { full_name: "David Chen", specialties: "Barber" },
    service_details: { name: "Luxury Hair Cut & Styling", price: 80, duration: 45 },
  },
  {
    id: 108, customer: 8, staff: 3,
    scheduled_start: `${today}T14:00:00`, scheduled_end: `${today}T15:00:00`,
    status: "confirmed",
    customer_details: { full_name: "Phoebe Buffay", phone: "0966-777-888" },
    employee_details: { full_name: "Clara Reynolds", specialties: "Nail Specialist" },
    service_details: { name: "Premium Gel Nail Art", price: 65, duration: 50 },
  },
  {
    id: 109, customer: 3, staff: 5,
    scheduled_start: `${today}T07:30:00`, scheduled_end: `${today}T08:00:00`,
    status: "cancelled", cancellation_reason: "Customer request",
    customer_details: { full_name: "Charlotte York", phone: "0901-222-333" },
    employee_details: { full_name: "Sophie Laurent", specialties: "Colorist" },
    service_details: { name: "Express Blowout", price: 45, duration: 30 },
  },
];

/* ── Stats helper ── */
export const getMockStats = (appointments: Appointment[]) => {
  const waiting = appointments.filter((a) => ["requested", "confirmed", "arrived"].includes(a.status)).length;
  const inService = appointments.filter((a) => a.status === "in_service").length;
  const awaitingPayment = appointments.filter((a) => a.status === "completed").length;
  const staffAvailable = mockStaffOnDuty.filter((s) => s.status === "available").length;
  const todayRevenue = appointments
    .filter((a) => a.status === "invoiced" || a.status === "closed")
    .reduce((sum, a) => sum + (a.service_details?.price || 0), 0);

  return {
    appointmentsToday: appointments.length,
    waiting,
    inService,
    awaitingPayment,
    staffAvailable,
    todayRevenue,
  };
};

/* ── Pending invoices mock ── */
export interface MockPendingInvoice {
  id: number;
  customerName: string;
  appointmentId: number;
  total: number;
  status: string;
}

export const mockPendingInvoices: MockPendingInvoice[] = [
  { id: 201, customerName: "Rachel Green", appointmentId: 106, total: 45, status: "draft" },
  { id: 202, customerName: "Charlotte York", appointmentId: 103, total: 80, status: "draft" },
];
