import {
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Table, Typography } from "antd";

import { RevenueLineChart } from "../../components/charts/RevenueLineChart";
import { ServicePieChart } from "../../components/charts/ServicePieChart";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";

const revenueData = [
  { label: "Mon", revenue: 1200 },
  { label: "Tue", revenue: 1800 },
  { label: "Wed", revenue: 1450 },
  { label: "Thu", revenue: 2300 },
  { label: "Fri", revenue: 2750 },
  { label: "Sat", revenue: 3300 },
  { label: "Sun", revenue: 2100 },
];

const serviceData = [
  { label: "Hair Cut & Styling", value: 450 },
  { label: "Facial Care & Spa", value: 320 },
  { label: "Manicure & Nails", value: 240 },
  { label: "Massage Therapy", value: 180 },
  { label: "Hair Coloring", value: 290 },
];

const recentAppointments = [
  { id: "A109", customer: "Sophia Lauren", service: "Balayage & Hair Trim", time: "10:30 AM", status: "completed" },
  { id: "A110", customer: "Liam Neeson", service: "Men's Premium Styling", time: "11:15 AM", status: "in_service" },
  { id: "A111", customer: "Olivia Wilde", service: "Spa Facial Treatment", time: "12:00 PM", status: "confirmed" },
  { id: "A112", customer: "Charlotte York", service: "Gel Manicure & Pedicure", time: "01:30 PM", status: "requested" },
  { id: "A113", customer: "Emma Watson", service: "Aromatherapy Massage", time: "02:15 PM", status: "confirmed" },
];

const appointmentColumns = [
  {
    title: "Appointment ID",
    dataIndex: "id",
    key: "id",
    render: (text: string) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{text}</span>,
  },
  {
    title: "Client",
    dataIndex: "customer",
    key: "customer",
    render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
  },
  {
    title: "Requested Service",
    dataIndex: "service",
    key: "service",
  },
  {
    title: "Scheduled Time",
    dataIndex: "time",
    key: "time",
    render: (text: string) => <span style={{ color: "var(--color-muted)" }}>{text}</span>,
  },
  {
    title: "Booking Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => <StatusTag status={status} />,
  },
];

export const DashboardPage = () => (
  <>
    <PageHeader 
      title="Salon Overview" 
      description="Real-time operational insights, revenue stats, and guest bookings." 
    />
    
    {/* KPI Row */}
    <section className="dashboard-grid">
      <Card className="kpi-card" bordered={false}>
        <div className="kpi-card-content">
          <div>
            <Typography.Paragraph style={{ margin: 0, color: "var(--color-muted)", fontSize: 13, fontWeight: 500, textTransform: "uppercase" }}>
              APPOINTMENTS TODAY
            </Typography.Paragraph>
            <Typography.Title level={2} style={{ margin: "8px 0 4px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
              18
            </Typography.Title>
            <span className="kpi-trend kpi-trend-up">
              <ArrowUpOutlined /> +12.5% <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>vs yesterday</span>
            </span>
          </div>
          <div className="kpi-icon-wrapper">
            <CalendarOutlined />
          </div>
        </div>
      </Card>

      <Card className="kpi-card" bordered={false}>
        <div className="kpi-card-content">
          <div>
            <Typography.Paragraph style={{ margin: 0, color: "var(--color-muted)", fontSize: 13, fontWeight: 500, textTransform: "uppercase" }}>
              TODAY REVENUE
            </Typography.Paragraph>
            <Typography.Title level={2} style={{ margin: "8px 0 4px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
              $12,480
            </Typography.Title>
            <span className="kpi-trend kpi-trend-up">
              <ArrowUpOutlined /> +8.2% <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>vs last week</span>
            </span>
          </div>
          <div className="kpi-icon-wrapper">
            <DollarOutlined />
          </div>
        </div>
      </Card>

      <Card className="kpi-card" bordered={false}>
        <div className="kpi-card-content">
          <div>
            <Typography.Paragraph style={{ margin: 0, color: "var(--color-muted)", fontSize: 13, fontWeight: 500, textTransform: "uppercase" }}>
              ACTIVE CUSTOMERS
            </Typography.Paragraph>
            <Typography.Title level={2} style={{ margin: "8px 0 4px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
              326
            </Typography.Title>
            <span className="kpi-trend kpi-trend-up">
              <ArrowUpOutlined /> +4.7% <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>this month</span>
            </span>
          </div>
          <div className="kpi-icon-wrapper">
            <TeamOutlined />
          </div>
        </div>
      </Card>

      <Card className="kpi-card" bordered={false}>
        <div className="kpi-card-content">
          <div>
            <Typography.Paragraph style={{ margin: 0, color: "var(--color-muted)", fontSize: 13, fontWeight: 500, textTransform: "uppercase" }}>
              STAFF ON DUTY
            </Typography.Paragraph>
            <Typography.Title level={2} style={{ margin: "8px 0 4px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
              8
            </Typography.Title>
            <span className="kpi-trend" style={{ color: "var(--color-primary-dark)" }}>
              100% <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>attendance</span>
            </span>
          </div>
          <div className="kpi-icon-wrapper">
            <UserOutlined />
          </div>
        </div>
      </Card>
    </section>

    {/* Charts Row */}
    <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
      <Col xs={24} lg={16}>
        <Card title="Weekly Revenue Stream" bordered={false} className="chart-card" style={{ height: 420 }}>
          <div style={{ height: 320 }}>
            <RevenueLineChart data={revenueData} />
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title="Popular Services" bordered={false} className="chart-card" style={{ height: 420 }}>
          <div style={{ height: 260 }}>
            <ServicePieChart data={serviceData} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
            {serviceData.map((item, index) => (
              <span key={item.label} style={{ fontSize: 11, color: "var(--color-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: ["#bca374", "#d4b26f", "#8e8a80", "#c5a880", "#e5d3b3"][index] }} />
                {item.label}
              </span>
            ))}
          </div>
        </Card>
      </Col>
    </Row>

    {/* Recent Appointments & Activities */}
    <Card title="Recent Bookings & Check-ins" bordered={false} style={{ marginBottom: 16 }}>
      <Table
        columns={appointmentColumns}
        dataSource={recentAppointments}
        rowKey="id"
        pagination={false}
        size="middle"
      />
    </Card>
  </>
);
