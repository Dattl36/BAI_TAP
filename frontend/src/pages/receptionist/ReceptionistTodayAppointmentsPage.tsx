import { useState, useEffect } from "react";
import { Button, Card, Input, Select, Space, Table, message, Tabs, Modal, Form, Badge, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  UserOutlined, 
  StopOutlined, 
  DollarOutlined, 
  EyeOutlined,
  SwapOutlined,
  PlayCircleOutlined
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { appointmentsApi } from "../../api/appointments.api";
import { employeesApi } from "../../api/employees.api";
import { invoicesApi } from "../../api/invoices.api";
import { StatusTag } from "../../components/common/StatusTag";
import { ErrorState } from "../../components/common/ErrorState";
import { AppointmentDetailModal } from "../../components/receptionist/AppointmentDetailModal";
import { queryKeys } from "../../constants/queryKeys";
import type { Appointment, AppointmentStatus } from "../../types/appointment";
import type { Employee } from "../../types/employee";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/date";

export const ReceptionistTodayAppointmentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("queue");

  // Selection states
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Cancellation Modal States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelAppId, setCancelAppId] = useState<number | string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  // Reassign Modal States
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignApp, setReassignApp] = useState<Appointment | null>(null);
  const [selectedStylistId, setSelectedStylistId] = useState<number | string | null>(null);
  const [stylists, setStylists] = useState<Employee[]>([]);

  // Fetch today's appointments
  const today = dayjs().format("YYYY-MM-DD");
  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.list({ date: today }),
    queryFn: () => appointmentsApi.list({ scheduled_date: today }),
  });

  // Fetch stylists list for reassign
  useEffect(() => {
    const fetchStylists = async () => {
      try {
        const res = await employeesApi.list({ role_type: "staff", employment_status: "active" });
        setStylists(getListItems(res));
      } catch (err) {
        // Silent error
      }
    };
    void fetchStylists();
  }, []);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.receptionistDashboard });
  };

  // Status transitions
  const confirmMutation = useMutation({
    mutationFn: (id: number | string) => appointmentsApi.confirm(id),
    onSuccess: () => { void message.success("Appointment confirmed"); invalidate(); },
    onError: (err) => { void message.error(getErrorMessage(err)); },
  });

  const arriveMutation = useMutation({
    mutationFn: (id: number | string) => appointmentsApi.arrive(id),
    onSuccess: () => { void message.success("Client marked as arrived"); invalidate(); },
    onError: (err) => { void message.error(getErrorMessage(err)); },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) => appointmentsApi.cancel(id, reason),
    onSuccess: () => { 
      void message.success("Appointment cancelled successfully"); 
      setIsCancelModalOpen(false);
      setCancellationReason("");
      invalidate(); 
    },
    onError: (err) => { void message.error(getErrorMessage(err)); },
  });

  const reassignMutation = useMutation({
    mutationFn: ({ id, staffId, start, end }: { id: number | string; staffId: number | string; start: string; end: string }) => 
      appointmentsApi.reschedule(id, { staff: staffId, scheduled_start: start, scheduled_end: end }),
    onSuccess: () => {
      void message.success("Stylist reassigned successfully");
      setIsReassignModalOpen(false);
      setSelectedStylistId(null);
      invalidate();
    },
    onError: (err) => { void message.error(getErrorMessage(err)); },
  });

  // Checkout process: generate invoice, transition status to invoiced, navigate
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const handleCheckout = async (appointmentId: number | string) => {
    setCheckoutLoading(true);
    try {
      // Create or get existing invoice
      const invoiceRes = await invoicesApi.createFromAppointment(appointmentId);
      
      // Update appointment status to invoiced
      await appointmentsApi.update(appointmentId, { status: "invoiced" });

      void message.success("Checkout invoice prepared");
      invalidate();
      
      if (invoiceRes.id) {
        navigate(`/receptionist/invoices/${invoiceRes.id}`);
      }
    } catch (err: any) {
      void message.error(err?.response?.data?.message || err?.message || "Failed to generate checkout invoice");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const isActing = 
    confirmMutation.isPending || 
    arriveMutation.isPending || 
    cancelMutation.isPending || 
    reassignMutation.isPending ||
    checkoutLoading;

  const openCancelModal = (id: number | string) => {
    setCancelAppId(id);
    setCancellationReason("");
    setIsCancelModalOpen(true);
  };

  const openReassignModal = (app: Appointment) => {
    setReassignApp(app);
    setSelectedStylistId(app.staff);
    setIsReassignModalOpen(true);
  };

  const handleCancelSubmit = () => {
    if (!cancelAppId) return;
    cancelMutation.mutate({ id: cancelAppId, reason: cancellationReason });
  };

  const handleReassignSubmit = () => {
    if (!reassignApp || !selectedStylistId) return;
    reassignMutation.mutate({
      id: reassignApp.id,
      staffId: selectedStylistId,
      start: reassignApp.scheduled_start,
      end: reassignApp.scheduled_end
    });
  };

  const showDetails = (app: Appointment) => {
    setSelectedApp(app);
    setIsDetailOpen(true);
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: "Code",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <Button type="link" onClick={() => showDetails(record)} style={{ padding: 0, fontWeight: 600 }}>
          #{id}
        </Button>
      ),
    },
    {
      title: "Client",
      key: "customer",
      render: (_, record) => {
        const details = record.customer_details;
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 500, color: "var(--color-primary-dark)" }}>
              {details?.full_name || `Client #${record.customer}`}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{details?.phone || "—"}</span>
          </div>
        );
      },
    },
    {
      title: "Service",
      key: "service",
      render: (_, record) => {
        const details = record.service_details;
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>{details?.name || "Service Session"}</span>
            <span style={{ fontSize: 11, color: "var(--color-primary)" }}>
              {details?.price ? `$${Number(details.price).toFixed(2)}` : ""} • {details?.duration ? `${details.duration} min` : ""}
            </span>
          </div>
        );
      },
    },
    {
      title: "Stylist",
      key: "staff",
      render: (_, record) => {
        const details = record.employee_details;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{details?.full_name || `Stylist #${record.staff}`}</span>
            {["requested", "confirmed", "arrived"].includes(record.status) && (
              <Button 
                type="text" 
                size="small" 
                icon={<SwapOutlined style={{ color: "var(--color-primary)" }} />} 
                onClick={(e) => { e.stopPropagation(); openReassignModal(record); }} 
                title="Reassign Stylist"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Scheduled Time",
      dataIndex: "scheduled_start",
      key: "time",
      render: (value: any) => formatDateTime(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: "Front Desk Operations",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
          >
            Details
          </Button>

          {record.status === "requested" && (
            <Button
              size="small"
              type="text"
              icon={<CheckCircleOutlined style={{ color: "var(--rcpt-success)" }} />}
              loading={confirmMutation.isPending}
              disabled={isActing}
              onClick={() => confirmMutation.mutate(record.id)}
            >
              Confirm
            </Button>
          )}

          {record.status === "confirmed" && (
            <Button
              size="small"
              type="text"
              icon={<UserOutlined style={{ color: "var(--rcpt-blue)" }} />}
              loading={arriveMutation.isPending}
              disabled={isActing}
              onClick={() => arriveMutation.mutate(record.id)}
            >
              Check-in
            </Button>
          )}

          {(record.status === "completed" || record.status === "invoiced") && (
            <Button
              size="small"
              type="primary"
              className="rcpt-btn-gold"
              icon={<DollarOutlined />}
              loading={checkoutLoading}
              disabled={isActing}
              onClick={() => handleCheckout(record.id)}
            >
              Checkout Desk
            </Button>
          )}

          {record.status !== "completed" &&
            record.status !== "cancelled" &&
            record.status !== "invoiced" &&
            record.status !== "closed" && (
              <Button
                size="small"
                type="text"
                danger
                icon={<StopOutlined />}
                loading={cancelMutation.isPending}
                disabled={isActing}
                onClick={() => openCancelModal(record.id)}
              >
                Cancel
              </Button>
            )}
        </Space>
      ),
    },
  ];

  const allAppointments = getListItems(appointmentsQuery.data);

  // Filter list by search query
  const searchedAppointments = allAppointments.filter((app) => {
    const customerName = (app.customer_details?.full_name || "").toLowerCase();
    const customerPhone = (app.customer_details?.phone || "");
    const staffName = (app.employee_details?.full_name || "").toLowerCase();
    const idStr = String(app.id || "");
    const searchLower = searchText.toLowerCase();

    return (
      !searchText ||
      customerName.includes(searchLower) ||
      customerPhone.includes(searchText) ||
      staffName.includes(searchLower) ||
      idStr.includes(searchText)
    );
  });

  // Category splits
  const queueList = searchedAppointments.filter((a) => 
    ["requested", "confirmed", "arrived"].includes(a.status)
  );
  
  const inServiceList = searchedAppointments.filter((a) => 
    a.status === "in_service"
  );
  
  const awaitingList = searchedAppointments.filter((a) => 
    ["completed", "invoiced"].includes(a.status)
  );
  
  const historyList = searchedAppointments.filter((a) => 
    ["closed", "cancelled", "no_show"].includes(a.status)
  );

  return (
    <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      {/* Search Bar Operations */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Input
          placeholder="Search customer name, phone, or appointment code..."
          prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 400, borderRadius: 8, height: 40 }}
        />
        
        <Link to="/receptionist/appointments/create">
          <Button type="primary" className="login-button-gold" icon={<PlayCircleOutlined />} style={{ height: 40 }}>
            Quick Walk-in Reserve
          </Button>
        </Link>
      </div>

      {appointmentsQuery.isError ? (
        <ErrorState message={getErrorMessage(appointmentsQuery.error)} onRetry={() => void appointmentsQuery.refetch()} />
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="line"
          tabBarStyle={{ marginBottom: 16 }}
          items={[
            {
              key: "queue",
              label: (
                <span>
                  Today's Queue{" "}
                  <Badge count={queueList.length} showZero color="var(--color-primary-dark)" offset={[8, -3]} />
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={queueList}
                  loading={appointmentsQuery.isLoading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              )
            },
            {
              key: "service",
              label: (
                <span>
                  In Service{" "}
                  <Badge count={inServiceList.length} showZero color="#8b5cf6" offset={[8, -3]} />
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={inServiceList}
                  loading={appointmentsQuery.isLoading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              )
            },
            {
              key: "awaiting",
              label: (
                <span>
                  Awaiting Payment{" "}
                  <Badge count={awaitingList.length} showZero color="var(--rcpt-gold)" offset={[8, -3]} />
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={awaitingList}
                  loading={appointmentsQuery.isLoading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              )
            },
            {
              key: "history",
              label: (
                <span>
                  Completed / Closed{" "}
                  <Badge count={historyList.length} showZero color="var(--color-muted)" offset={[8, -3]} />
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={historyList}
                  loading={appointmentsQuery.isLoading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              )
            }
          ]}
        />
      )}

      {/* Appointment Details Modal */}
      <AppointmentDetailModal
        open={isDetailOpen}
        appointment={selectedApp}
        onClose={() => { setSelectedApp(null); setIsDetailOpen(false); }}
        onCheckin={(id) => arriveMutation.mutate(id)}
        onAssignStaff={(id) => {
          const app = allAppointments.find((a) => a.id === id);
          if (app) openReassignModal(app);
        }}
        onCancel={(id) => openCancelModal(id)}
        onCreateInvoice={(id) => handleCheckout(id)}
        loading={isActing}
      />

      {/* Reassign Stylist Modal */}
      <Modal
        title={
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
            Reassign Salon Stylist
          </div>
        }
        open={isReassignModalOpen}
        onCancel={() => setIsReassignModalOpen(false)}
        onOk={handleReassignSubmit}
        confirmLoading={reassignMutation.isPending}
        destroyOnClose
      >
        <div style={{ padding: "8px 0" }}>
          <p style={{ color: "var(--color-muted)", fontSize: 13, marginBottom: 16 }}>
            Select a new stylist to assign for this appointment. Existing date and hours will remain unchanged.
          </p>
          <Form layout="vertical">
            <Form.Item label="Select Stylist" required>
              <Select
                placeholder="Select a specialist"
                value={selectedStylistId}
                onChange={setSelectedStylistId}
                options={stylists.map((s) => ({
                  value: s.id,
                  label: `${s.full_name} (${s.specialties || "Specialist"})`
                }))}
                style={{ height: 40 }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        title={
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#ef4444" }}>
            Cancel Appointment
          </div>
        }
        open={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        onOk={handleCancelSubmit}
        confirmLoading={cancelMutation.isPending}
        okText="Cancel Queue"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <div style={{ padding: "8px 0" }}>
          <p style={{ color: "var(--color-muted)", fontSize: 13, marginBottom: 16 }}>
            Are you sure you want to cancel this appointment? This action cannot be undone. Please specify a reason.
          </p>
          <Form layout="vertical">
            <Form.Item label="Cancellation Reason" required>
              <Input.TextArea
                placeholder="Reason for cancellation (e.g. client requested, schedule conflict)"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </Card>
  );
};
