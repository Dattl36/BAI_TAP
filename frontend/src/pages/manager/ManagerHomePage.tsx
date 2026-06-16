import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  GiftOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Table, Typography, Segmented, Space, Button } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import { vouchersApi } from "../../api/vouchers.api";
import { RevenueLineChart } from "../../components/charts/RevenueLineChart";
import { AppointmentStatusChart } from "../../components/charts/AppointmentStatusChart";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { useManagerDashboardData } from "../../hooks/queries/useManagerDashboardData";
import { formatMoney } from "../../utils/money";
import { formatDateTime } from "../../utils/date";
import { getListItems } from "../../utils/apiResponse";

export const ManagerHomePage = () => {
  const [trendMode, setTrendMode] = useState<"day" | "week" | "month">("day");

  const {
    isLoading: isDashLoading,
    isError: isDashError,
    error: dashError,
    revenueReport,
    recentAppointments,
    invoices = [],
    employees = [],
    customerCount = 0,
    employeeCount = 0,
    refetch,
  } = useManagerDashboardData();

  // Fetch vouchers to determine the active voucher count
  const vouchersQuery = useQuery({
    queryKey: ["vouchers", "list", { limit: 100 }],
    queryFn: () => vouchersApi.list({ limit: 100 }),
  });

  const isLoading = isDashLoading || vouchersQuery.isLoading;
  const isError = isDashError || vouchersQuery.isError;
  const errorMessage = dashError ? String(dashError) : "Failed to load dashboard data.";

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={refetch} />;
  }

  // Calculate stats based on actual data
  const todayStr = dayjs().format("YYYY-MM-DD");

  // Today's revenue (sum of paid invoices created today)
  const invoicesToday = invoices.filter(
    (inv) => inv.created_at && dayjs(inv.created_at).format("YYYY-MM-DD") === todayStr
  );
  const todayRevenue = invoicesToday.reduce(
    (sum, inv) => sum + (Number(inv.paid_amount) || Number(inv.total_due) || 0),
    0
  );

  // Weekly revenue (sum of paid invoices created this week)
  const startOfWeek = dayjs().startOf("week");
  const invoicesThisWeek = invoices.filter(
    (inv) => inv.created_at && dayjs(inv.created_at).isAfter(startOfWeek)
  );
  const weeklyRevenue = invoicesThisWeek.reduce(
    (sum, inv) => sum + (Number(inv.paid_amount) || Number(inv.total_due) || 0),
    0
  );

  // Monthly revenue (sum of paid invoices created this month)
  const startOfMonth = dayjs().startOf("month");
  const invoicesThisMonth = invoices.filter(
    (inv) => inv.created_at && dayjs(inv.created_at).isAfter(startOfMonth)
  );
  const monthlyRevenue = invoicesThisMonth.reduce(
    (sum, inv) => sum + (Number(inv.paid_amount) || Number(inv.total_due) || 0),
    0
  );

  // Today's appointments
  const appointmentsToday = recentAppointments.filter(
    (apt) => apt.scheduled_start && dayjs(apt.scheduled_start).format("YYYY-MM-DD") === todayStr
  );
  const todayAppointmentsCount = appointmentsToday.length;

  // Active Staff (employment_status === "active")
  const activeStaffCount = employees.filter((emp) => emp.employment_status === "active").length;

  // Active Vouchers
  const vouchers = getListItems(vouchersQuery.data);
  const activeVouchersCount = vouchers.filter((v) => v.status === "active").length;

  // Total Invoices Today / Overall
  const totalInvoicesToday = invoicesToday.length;
  const totalInvoicesOverall = invoices.length;

  // Dynamic grouping for Revenue Trend Chart
  const groupInvoicesByWeek = (invList: any[]) => {
    const currentMonth = dayjs().startOf("month");
    const weekSums = [0, 0, 0, 0];
    invList.forEach((inv) => {
      const date = dayjs(inv.created_at);
      if (date.isSame(currentMonth, "month") && inv.status !== "cancelled") {
        const dayNum = date.date();
        const amt = Number(inv.paid_amount) || Number(inv.total_due) || 0;
        if (dayNum <= 7) weekSums[0] += amt;
        else if (dayNum <= 14) weekSums[1] += amt;
        else if (dayNum <= 21) weekSums[2] += amt;
        else weekSums[3] += amt;
      }
    });
    return [
      { label: "W1 (1-7)", revenue: weekSums[0] },
      { label: "W2 (8-14)", revenue: weekSums[1] },
      { label: "W3 (15-21)", revenue: weekSums[2] },
      { label: "W4 (22+)", revenue: weekSums[3] },
    ];
  };

  const groupInvoicesByMonth = (invList: any[]) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthSums = Array(12).fill(0);
    invList.forEach((inv) => {
      const date = dayjs(inv.created_at);
      if (date.isSame(dayjs(), "year") && inv.status !== "cancelled") {
        const monthIdx = date.month();
        const amt = Number(inv.paid_amount) || Number(inv.total_due) || 0;
        monthSums[monthIdx] += amt;
      }
    });
    return monthNames.map((label, idx) => ({
      label,
      revenue: monthSums[idx],
    }));
  };

  const getChartData = () => {
    switch (trendMode) {
      case "week":
        return groupInvoicesByWeek(invoices);
      case "month":
        return groupInvoicesByMonth(invoices);
      case "day":
      default:
        // Use dailySeries calculated in reportAdapters.ts
        return revenueReport.dailySeries;
    }
  };

  // Dynamic grouping for Appointment Status Distribution
  const appointmentStatuses = ["requested", "confirmed", "arrived", "in_service", "completed", "invoiced", "cancelled", "no_show"];
  const statusCounts: Record<string, number> = {};
  appointmentStatuses.forEach(s => { statusCounts[s] = 0; });
  
  // Aggregate from all loaded appointments (recentAppointments contains up to 100 entries)
  recentAppointments.forEach((apt) => {
    if (apt.status) {
      statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1;
    }
  });

  const formatStatusName = (status: string) => {
    if (status === "in_service") return "In Service";
    if (status === "no_show") return "No Show";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: formatStatusName(status),
    value: count,
  }));

  // Top 5 recent invoices
  const sortedInvoices = [...invoices]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  const invoiceColumns = [
    {
      title: "Invoice ID",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>#INV-{id}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (custId: number) => <span>Client #{custId}</span>,
    },
    {
      title: "Issued At",
      dataIndex: "created_at",
      key: "created_at",
      render: (val: string) => formatDateTime(val),
    },
    {
      title: "Final Due",
      dataIndex: "total_due",
      key: "total_due",
      render: (val: string | number) => <span style={{ fontWeight: 600 }}>{formatMoney(val)}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusTag status={status} />,
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Welcome Banner Panel */}
      <Card
        bordered={false}
        style={{
          background: "linear-gradient(135deg, #1f1d1a 0%, #141412 100%)",
          color: "#ffffff",
          borderRadius: 20,
          marginBottom: 32,
          padding: "12px 16px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <Typography.Title level={2} style={{ margin: 0, color: "#faf7f2", fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              Business Control Center
            </Typography.Title>
            <Typography.Paragraph style={{ marginTop: 8, color: "#a3a19c", fontSize: 14, margin: 0 }}>
              Today is {dayjs().format("dddd, MMMM D, YYYY")} — Oversee revenue streams, schedule operations, and monitor campaign outputs.
            </Typography.Paragraph>
          </div>
          <Space>
            <Link to="/manager/invoices">
              <Button type="primary" className="login-button-gold">
                Billing Log
              </Button>
            </Link>
            <Link to="/manager/appointments">
              <Button ghost style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)", borderRadius: 8 }}>
                Salon Calendar
              </Button>
            </Link>
          </Space>
        </div>
      </Card>

      {/* KPI Cards Row 1 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" bordered={false}>
            <div className="kpi-card-content">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  TODAY'S REVENUE
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: "6px 0 2px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                  {formatMoney(todayRevenue)}
                </Typography.Title>
                <span className="kpi-trend kpi-trend-up">
                  <RiseOutlined /> {totalInvoicesToday} invoices paid today
                </span>
              </div>
              <div className="kpi-icon-wrapper" style={{ background: "var(--color-accent)", color: "var(--color-primary-dark)" }}>
                <DollarOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" bordered={false}>
            <div className="kpi-card-content">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  WEEKLY REVENUE
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: "6px 0 2px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                  {formatMoney(weeklyRevenue)}
                </Typography.Title>
                <span className="kpi-trend" style={{ color: "var(--color-primary-dark)" }}>
                  Current week total
                </span>
              </div>
              <div className="kpi-icon-wrapper">
                <RiseOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" bordered={false}>
            <div className="kpi-card-content">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  MONTHLY REVENUE
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: "6px 0 2px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                  {formatMoney(monthlyRevenue)}
                </Typography.Title>
                <span className="kpi-trend" style={{ color: "var(--color-primary-dark)" }}>
                  Current month billing
                </span>
              </div>
              <div className="kpi-icon-wrapper">
                <DollarOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" bordered={false}>
            <div className="kpi-card-content">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  TOTAL BILLINGS LOGGED
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: "6px 0 2px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                  {totalInvoicesOverall}
                </Typography.Title>
                <span className="kpi-trend" style={{ color: "var(--color-muted)" }}>
                  Invoices recorded
                </span>
              </div>
              <div className="kpi-icon-wrapper">
                <FileTextOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* KPI Cards Row 2 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8} lg={8}>
          <Card className="kpi-card" bordered={false}>
            <div className="kpi-card-content">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  APPOINTMENTS TODAY
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: "6px 0 2px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                  {todayAppointmentsCount}
                </Typography.Title>
                <span className="kpi-trend" style={{ color: "var(--color-primary-dark)" }}>
                  Bookings for today
                </span>
              </div>
              <div className="kpi-icon-wrapper">
                <CalendarOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8} lg={8}>
          <Card className="kpi-card" bordered={false}>
            <div className="kpi-card-content">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  ACTIVE STYLISTS
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: "6px 0 2px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                  {activeStaffCount} / {employeeCount}
                </Typography.Title>
                <span className="kpi-trend" style={{ color: "green" }}>
                  Employment active
                </span>
              </div>
              <div className="kpi-icon-wrapper">
                <UserOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8} lg={8}>
          <Card className="kpi-card" bordered={false}>
            <div className="kpi-card-content">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  ACTIVE CAMPAIGN VOUCHERS
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: "6px 0 2px", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                  {activeVouchersCount}
                </Typography.Title>
                <span className="kpi-trend" style={{ color: "var(--color-primary-dark)" }}>
                  Available codes for registry
                </span>
              </div>
              <div className="kpi-icon-wrapper">
                <GiftOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Revenue Performance Trend</span>
                <Segmented
                  options={[
                    { label: "Day", value: "day" },
                    { label: "Week", value: "week" },
                    { label: "Month", value: "month" },
                  ]}
                  value={trendMode}
                  onChange={(val) => setTrendMode(val as any)}
                  style={{ fontWeight: 500 }}
                />
              </div>
            }
            bordered={false}
            className="chart-card"
            style={{ height: 440 }}
          >
            <div style={{ height: 320, marginTop: 16 }}>
              <RevenueLineChart data={getChartData()} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Appointment Status Share" bordered={false} className="chart-card" style={{ height: 440 }}>
            <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AppointmentStatusChart data={statusChartData} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Table */}
      <Card
        title="Recent Invoices Feed"
        bordered={false}
        extra={
          <Link to="/manager/invoices">
            <Button type="link" icon={<ArrowRightOutlined />}>
              View All Invoices
            </Button>
          </Link>
        }
      >
        {sortedInvoices.length > 0 ? (
          <Table
            columns={invoiceColumns}
            dataSource={sortedInvoices}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        ) : (
          <EmptyState description="No recent bills or invoicing logged." />
        )}
      </Card>
    </div>
  );
};
