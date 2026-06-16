import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  TeamOutlined,
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
  const completedCount = allToday.filter(
    (a) => a.status === "completed" || a.status === "invoiced" || a.status === "closed"
  ).length;

  const stats = [
    { label: "Lịch hẹn hôm nay", count: checkInCount, icon: <TeamOutlined />, color: "var(--color-primary-dark)" },
    { label: "Đã đến / Chờ đợi", count: arrivedCount, icon: <ClockCircleOutlined />, color: "#06b6d4" },
    { label: "Đang phục vụ", count: inServiceCount, icon: <CalendarOutlined />, color: "#8b5cf6" },
    { label: "Đã hoàn thành", count: completedCount, icon: <CheckCircleOutlined />, color: "#10b981" },
  ];

  const checkoutQueue = allToday.filter(
    (a) => a.status === "arrived" || a.status === "in_service"
  );

  const checkoutColumns = [
    {
      title: "Mã lịch hẹn",
      dataIndex: "id",
      key: "id",
      render: (id: number | string) => <span style={{ fontWeight: 600 }}>#{id}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (val: number | string) => <span>KH #{val}</span>,
    },
    {
      title: "Nhân viên",
      dataIndex: "staff",
      key: "staff",
      render: (val: number | string) => <span>NV #{val}</span>,
    },
    {
      title: "Giờ hẹn",
      dataIndex: "scheduled_start",
      key: "scheduled_start",
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: "Thao tác nhanh",
      key: "action",
      render: (_: unknown, record: Appointment) => (
        <Link to={`/receptionist/invoices`}>
          <Button type="primary" size="small" style={{ borderRadius: 6, fontSize: 11 }}>
            Thanh toán #{record.id}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Welcom Banner */}
      <div className="rcpt-welcome-banner" style={{ marginBottom: 28 }}>
        <div className="banner-content">
          <div>
            <h2 className="banner-title">Trung tâm điều hành lễ tân</h2>
            <p className="banner-subtitle">
              Hôm nay, {dayjs().format("dddd DD/MM/YYYY")} — Kiểm tra lịch hẹn, hoàn tất check-in và quản lý hóa đơn.
            </p>
          </div>
          <Link to="/receptionist/appointments/create">
            <Button type="primary" size="large" className="login-button-gold" icon={<PlusOutlined />}>
              Thêm khách vãng lai
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
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
                  width: 44, height: 44,
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

      {/* Queue Table */}
      <Card
        title={
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
            Hàng đợi thanh toán đang hoạt động
          </span>
        }
        variant="borderless"
        style={{ marginBottom: 32 }}
      >
        {checkoutQueue.length === 0 && !appointmentsQuery.isLoading ? (
          <EmptyState description="Chưa có khách đã đến hoặc đang phục vụ." />
        ) : (
          <Table
            dataSource={checkoutQueue}
            columns={checkoutColumns}
            loading={appointmentsQuery.isLoading}
            rowKey="id"
            pagination={false}
            size="middle"
            locale={{ emptyText: "Không có dữ liệu" }}
          />
        )}
      </Card>
    </div>
  );
};
