import {
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  PlusOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Table, Typography } from "antd";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import { appointmentsApi } from "../../api/appointments.api";
import { StatusTag } from "../../components/common/StatusTag";
import { EmptyState } from "../../components/common/EmptyState";
import { queryKeys } from "../../constants/queryKeys";
import type { Appointment } from "../../types/appointment";
import { getListItems } from "../../utils/apiResponse";
import { formatDateTime } from "../../utils/date";

export const ReceptionistHomePage = () => {
  const today = dayjs().format("YYYY-MM-DD");

  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.list({ date: today }),
    queryFn: () => appointmentsApi.list({ scheduled_date: today }),
  });

  const allToday = getListItems(appointmentsQuery.data);

  const checkInCount = allToday.length;
  const arrivedCount = allToday.filter((a) => a.status === "arrived").length;
  const inServiceCount = allToday.filter((a) => a.status === "in_service").length;
  const completedCount = allToday.filter((a) => a.status === "completed" || a.status === "invoiced" || a.status === "closed").length;

  const stats = [
    { label: "Appointments Today", count: checkInCount, icon: <TeamOutlined />, color: "var(--color-primary-dark)" },
    { label: "Arrived / Waiting", count: arrivedCount, icon: <ClockCircleOutlined />, color: "#06b6d4" },
    { label: "In Service Session", count: inServiceCount, icon: <CalendarOutlined />, color: "#8b5cf6" },
    { label: "Completed Check-outs", count: completedCount, icon: <CheckCircleOutlined />, color: "#10b981" },
  ];

  // Checkout queue: arrived + in_service
  const checkoutQueue = allToday.filter(
    (a) => a.status === "arrived" || a.status === "in_service"
  );

  const checkoutColumns = [
    {
      title: "Booking Code",
      dataIndex: "id",
      key: "id",
      render: (id: number | string) => <span style={{ fontWeight: 600 }}>#{id}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (val: number | string) => <span>Customer #{val}</span>,
    },
    {
      title: "Staff",
      dataIndex: "staff",
      key: "staff",
      render: (val: number | string) => <span>Staff #{val}</span>,
    },
    {
      title: "Scheduled At",
      dataIndex: "scheduled_start",
      key: "scheduled_start",
      render: (value: any) => formatDateTime(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: "Quick Action",
      key: "action",
      render: (_: unknown, record: Appointment) => (
        <Link to={`/receptionist/invoices`}>
          <Button type="primary" size="small" style={{ borderRadius: 6, fontSize: 11 }}>
            Checkout & Invoice #{record.id}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Front Desk Header Panel */}
      <Card
        variant="borderless"
        style={{
          background: "linear-gradient(135deg, #1f1d1a 0%, #141412 100%)",
          color: "#ffffff",
          borderRadius: 20,
          marginBottom: 32,
          padding: 8,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <Typography.Title level={2} style={{ margin: 0, color: "#faf7f2", fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              Front Desk Workspace
            </Typography.Title>
            <Typography.Paragraph style={{ marginTop: 8, color: "#a3a19c", fontSize: 14, margin: 0 }}>
              Today is {dayjs().format("dddd, MMMM D, YYYY")} — Review appointments, complete check-ins, and manage bills.
            </Typography.Paragraph>
          </div>
          <Link to="/receptionist/appointments/create">
            <Button type="primary" size="large" className="login-button-gold" icon={<PlusOutlined />}>
              Add Direct Walk-in
            </Button>
          </Link>
        </div>
      </Card>

      {/* Operations Quick Counters */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((s) => (
          <Col xs={12} sm={12} lg={6} key={s.label}>
            <Card variant="borderless" className="kpi-card" style={{ padding: "8px 0" }}>
              <div className="kpi-card-content">
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase" }}>
                    {s.label}
                  </Typography.Text>
                  <Typography.Title level={3} style={{ margin: "4px 0 0", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                    {appointmentsQuery.isLoading ? "—" : s.count}
                  </Typography.Title>
                </div>
                <div style={{
                  background: "var(--color-accent)",
                  color: s.color,
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Operational Table */}
      <Card title="Active Desk Billing Queue" variant="borderless" style={{ marginBottom: 32 }}>
        {checkoutQueue.length === 0 && !appointmentsQuery.isLoading ? (
          <EmptyState description="No clients currently arrived or in service." />
        ) : (
          <Table
            dataSource={checkoutQueue}
            columns={checkoutColumns}
            loading={appointmentsQuery.isLoading}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
};
