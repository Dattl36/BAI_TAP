import React, { useState } from "react";
import { Row, Col, Typography, Card, Space, Table, Button, message, Alert } from "antd";
import { 
  CalendarOutlined, 
  ScissorOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  UserOutlined,
  NotificationOutlined,
  RightOutlined,
  StarOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { stylistApi } from "../../api/stylist.api";
import { queryKeys } from "../../constants/queryKeys";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

// Import custom components
import { TodayStatsCard } from "../../components/staff/TodayStatsCard";
import { ActiveServiceCard } from "../../components/staff/ActiveServiceCard";
import { StatusBadge } from "../../components/staff/StatusBadge";
import { EmptyState } from "../../components/staff/EmptyState";
import { LoadingSkeleton } from "../../components/staff/LoadingSkeleton";
import { ErrorMessage } from "../../components/staff/ErrorMessage";
import { BookingDetailModal } from "../../components/staff/BookingDetailModal";

export const StaffHomePage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const today = dayjs().format("YYYY-MM-DD");

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 1. Fetch current Stylist profile
  const profileQuery = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: () => stylistApi.getMyProfile(),
  });

  // 2. Fetch today's appointments for this stylist
  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.list({ date: today }),
    queryFn: () => stylistApi.getMyAssignedBookings({ scheduled_date: today }),
  });

  const stylist = profileQuery.data;
  const todaySchedule = getListItems(appointmentsQuery.data);

  // Calculate dynamic stats
  const totalToday = todaySchedule.length;
  const activeCount = todaySchedule.filter(a => a.status === "in_service").length;
  const waitingCount = todaySchedule.filter(a => a.status === "arrived").length;
  const completedCount = todaySchedule.filter(a => ["completed", "invoiced", "closed"].includes(a.status)).length;
  const totalMins = todaySchedule
    .filter(a => ["completed", "invoiced", "closed", "in_service"].includes(a.status))
    .reduce((acc, curr) => acc + (curr.service_details?.duration || 45), 0);

  // Active (in_progress) session
  const activeSession = todaySchedule.find(a => a.status === "in_service");
  // Or next arrived (seated/checked-in), or next confirmed
  const nextSession = activeSession ?? todaySchedule.find(a => ["arrived", "confirmed"].includes(a.status));

  // 3. Start service mutation
  const startMutation = useMutation({
    mutationFn: (appointmentId: string | number) => stylistApi.startService(appointmentId),
    onSuccess: (data) => {
      void message.success("Đã bắt đầu ca phục vụ thành công!");
      // Invalidate queries to refresh home status
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.serviceExecutions.all });
      // Redirect directly to the service execution page for this session
      navigate(`/staff/executions/${data.appointment}`);
    },
    onError: (err) => {
      void message.error(`Không thể bắt đầu phục vụ: ${getErrorMessage(err)}`);
    }
  });

  const handleStartService = (appointmentId: string | number) => {
    startMutation.mutate(appointmentId);
  };

  const showBookingDetails = (record: any) => {
    setSelectedBooking(record);
    setIsDetailOpen(true);
  };

  const columns = [
    {
      title: "Giờ hẹn",
      dataIndex: "scheduled_start",
      key: "scheduled_start",
      render: (t: string) => <strong>{dayjs(t).format("HH:mm")}</strong>,
    },
    {
      title: "Mã đặt chỗ",
      dataIndex: "id",
      key: "id",
      render: (id: number | string) => <span>#{id}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: ["customer_details", "full_name"],
      key: "customer_name",
      render: (name: string, record: any) => name || `Khách hàng #${record.customer}`,
    },
    {
      title: "Dịch vụ chính",
      dataIndex: ["service_details", "name"],
      key: "service_name",
      render: (name: string) => name || "Dịch vụ đã chọn",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <StatusBadge status={s} />,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: any) => (
        <Button 
          type="text" 
          size="small" 
          icon={<RightOutlined style={{ color: "var(--color-primary)" }} />} 
          onClick={() => showBookingDetails(record)}
        />
      ),
    },
  ];

  if (profileQuery.isLoading || appointmentsQuery.isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <LoadingSkeleton type="stats" />
        <div style={{ marginTop: 24 }}>
          <LoadingSkeleton type="card" />
        </div>
      </div>
    );
  }

  if (profileQuery.isError) {
    return <ErrorMessage error={profileQuery.error} onRetry={() => void profileQuery.refetch()} />;
  }

  if (appointmentsQuery.isError) {
    return <ErrorMessage error={appointmentsQuery.error} onRetry={() => void appointmentsQuery.refetch()} />;
  }

  return (
    <div className="animate-fade-in">
      {/* Staff Greeting Banner */}
      <Card
        bordered={false}
        style={{
          background: "linear-gradient(135deg, #1f1d1a 0%, #141412 100%)",
          color: "#ffffff",
          borderRadius: 20,
          marginBottom: 24,
          padding: "8px 16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Space direction="vertical" size={2}>
            <span style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 600, letterSpacing: "0.1em" }}>
              KHÔNG GIAN LÀM VIỆC CỦA STYLIST
            </span>
            <Typography.Title level={2} style={{ margin: 0, color: "#faf7f2", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
              Xin chào, {stylist?.full_name || "Stylist Specialist"}
            </Typography.Title>
            <Typography.Text style={{ color: "#a3a19c", fontSize: 13 }}>
              Hôm nay là {dayjs().format("dddd, D MMMM, YYYY")} — Bạn có <strong>{totalToday}</strong> lịch hẹn cần thực hiện.
            </Typography.Text>
          </Space>
          <CalendarOutlined style={{ fontSize: 36, color: "var(--color-primary)", opacity: 0.8 }} />
        </div>
      </Card>

      {/* KPI Stats Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <TodayStatsCard 
            title="Lịch hẹn hôm nay" 
            value={totalToday} 
            icon={<CalendarOutlined />} 
            iconBg="rgba(188, 163, 116, 0.1)" 
            iconColor="var(--color-primary)" 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <TodayStatsCard 
            title="Khách đang chờ (Check-in)" 
            value={waitingCount} 
            icon={<ClockCircleOutlined />} 
            iconBg="rgba(8, 145, 178, 0.1)" 
            iconColor="#0891b2" 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <TodayStatsCard 
            title="Đang phục vụ" 
            value={activeCount} 
            icon={<ScissorOutlined />} 
            iconBg="rgba(124, 58, 237, 0.1)" 
            iconColor="#7c3aed" 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <TodayStatsCard 
            title="Đã hoàn thành hôm nay" 
            value={completedCount} 
            icon={<CheckCircleOutlined />} 
            iconBg="rgba(22, 163, 74, 0.1)" 
            iconColor="#16a34a" 
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Active Session & Next Appointment */}
        <Col xs={24} lg={14}>
          <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginBottom: 16 }}>
            Phiên phục vụ hiện tại & Tiếp theo
          </Typography.Title>

          {nextSession ? (
            <ActiveServiceCard 
              appointment={nextSession} 
              onStartService={handleStartService} 
              isStarting={startMutation.isPending}
            />
          ) : (
            <EmptyState 
              message="Hôm nay đã hoàn tất!" 
              description="Hiện tại bạn không có phiên phục vụ nào đang chạy hoặc lịch hẹn tiếp theo." 
            />
          )}

          {/* Quick Informational Alert */}
          <div style={{ marginTop: 24 }}>
            <Alert
              message={<strong style={{ color: "#854d0e" }}>Thông báo vận hành từ lễ tân</strong>}
              description="Hệ thống tự động liên thông dữ liệu. Khi lễ tân check-in khách tại quầy, trạng thái sẽ chuyển thành 'Khách đã đến' và xuất hiện nút khởi chạy phục vụ. Khi bạn ấn hoàn thành, hóa đơn sẽ tự động tạo ở khu vực chờ thanh toán của Lễ tân."
              type="warning"
              showIcon
              style={{ borderRadius: 12, backgroundColor: "#fefdf0", border: "1px solid #fef08a" }}
            />
          </div>
        </Col>

        {/* Today's Timeline Queue List */}
        <Col xs={24} lg={10}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              Hàng đợi phục vụ hôm nay
            </Typography.Title>
            <Link to="/staff/schedule" style={{ color: "var(--color-primary-dark)", fontWeight: 500, fontSize: 13 }}>
              Xem lịch trình <RightOutlined style={{ fontSize: 10 }} />
            </Link>
          </div>

          <Card bordered={false} style={{ padding: 0, border: "1px solid var(--app-border)", borderRadius: 16, boxShadow: "var(--shadow-card)" }}>
            {todaySchedule.length === 0 ? (
              <EmptyState 
                message="Không có lịch hẹn" 
                description="Bạn không có lịch đặt chỗ nào được gán trong ngày hôm nay." 
              />
            ) : (
              <Table
                dataSource={todaySchedule}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="middle"
                style={{ padding: 0 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Booking Detail Modal */}
      <BookingDetailModal 
        appointment={selectedBooking} 
        open={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        onStartService={handleStartService}
        isStarting={startMutation.isPending}
      />
    </div>
  );
};
