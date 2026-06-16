import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Space, Typography, Tag, message } from "antd";
import { ArrowLeftOutlined, ScissorOutlined, PlayCircleOutlined, CalendarOutlined, PhoneOutlined, UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { appointmentsApi } from "../../api/appointments.api";
import { stylistApi } from "../../api/stylist.api";
import { queryKeys } from "../../constants/queryKeys";
import { getErrorMessage } from "../../utils/error";

// Import custom components
import { StatusBadge } from "../../components/staff/StatusBadge";
import { LoadingSkeleton } from "../../components/staff/LoadingSkeleton";
import { ErrorMessage } from "../../components/staff/ErrorMessage";

export const StaffAppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load appointment details
  const appointmentQuery = useQuery({
    queryKey: queryKeys.appointments.detail(id ?? ""),
    queryFn: () => appointmentsApi.detail(id!),
    enabled: !!id,
  });

  const appointment = appointmentQuery.data;

  // Start service mutation
  const startMutation = useMutation({
    mutationFn: (appointmentId: string | number) => stylistApi.startService(appointmentId),
    onSuccess: (data) => {
      void message.success("Đã bắt đầu ca phục vụ thành công!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.serviceExecutions.all });
      navigate(`/staff/executions/${data.appointment}`);
    },
    onError: (err) => {
      void message.error(`Không thể bắt đầu phục vụ: ${getErrorMessage(err)}`);
    }
  });

  const handleStartService = () => {
    if (id) {
      startMutation.mutate(id);
    }
  };

  if (appointmentQuery.isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  if (appointmentQuery.isError) {
    return <ErrorMessage error={appointmentQuery.error} onRetry={() => void appointmentQuery.refetch()} />;
  }

  if (!appointment) {
    return (
      <Card>
        <Typography.Text type="secondary">Không tìm thấy thông tin lịch hẹn.</Typography.Text>
      </Card>
    );
  }

  const customerName = appointment.customer_details?.full_name || `Khách hàng #${appointment.customer}`;
  const customerPhone = appointment.customer_details?.phone || "Không có SĐT";
  const customerEmail = appointment.customer_details?.email || "Không có email";
  const serviceName = appointment.service_details?.name || "Dịch vụ đã chọn";
  const servicePrice = appointment.service_details?.price || 0;
  const duration = appointment.service_details?.duration || 45;
  const startTime = dayjs(appointment.scheduled_start).format("DD/MM/YYYY HH:mm");
  const endTime = dayjs(appointment.scheduled_end).format("HH:mm");
  const notes = appointment.cancellation_reason || appointment.no_show_reason || "Không có ghi chú.";
  const source = appointment.source === "receptionist" ? "Lễ tân quầy đặt" : "Khách hàng tự đặt Online";

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/staff" style={{ color: "var(--color-primary-dark)", fontWeight: 500 }}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Quay lại Bàn làm việc
        </Link>
      </div>

      <Card 
        bordered={false} 
        style={{ 
          borderRadius: 16, 
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--app-border)"
        }}
        title={
          <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Chi tiết phiên phục vụ #{appointment.id}
          </Typography.Title>
        }
        extra={<StatusBadge status={appointment.status} />}
      >
        <Descriptions title="Thông tin khách hàng" bordered column={1} size="small" labelStyle={{ fontWeight: 600, width: 200 }} contentStyle={{ background: "#faf8f5" }}>
          <Descriptions.Item label="Tên khách hàng">
            <UserOutlined style={{ marginRight: 6, color: "var(--color-primary)" }} /> {customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            <PhoneOutlined style={{ marginRight: 6, color: "var(--color-primary)" }} /> {customerPhone}
          </Descriptions.Item>
          <Descriptions.Item label="Email liên lạc">
            {customerEmail}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ margin: "24px 0" }} />

        <Descriptions title="Thông tin chi tiết dịch vụ & ca" bordered column={1} size="small" labelStyle={{ fontWeight: 600, width: 200 }} contentStyle={{ background: "#faf8f5" }}>
          <Descriptions.Item label="Khung giờ đặt lịch">
            <ClockCircleOutlined style={{ marginRight: 6, color: "var(--color-primary)" }} /> {startTime} - {endTime}
          </Descriptions.Item>
          <Descriptions.Item label="Thời lượng dự kiến">
            {duration} phút
          </Descriptions.Item>
          <Descriptions.Item label="Tên dịch vụ">
            <Tag color="gold">{serviceName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Phí ước tính">
            <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(servicePrice)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Nguồn đặt lịch">
            {source}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú dịch vụ">
            {notes}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          {appointment.status === "arrived" && (
            <Button 
              type="primary" 
              size="large" 
              className="btn-gold-premium" 
              icon={<PlayCircleOutlined />}
              loading={startMutation.isPending}
              onClick={handleStartService}
              style={{ height: 46 }}
            >
              Bắt đầu phục vụ
            </Button>
          )}

          {appointment.status === "in_service" && (
            <Link to={`/staff/executions/${appointment.id}`} style={{ flex: 1 }}>
              <Button 
                type="primary" 
                size="large" 
                className="btn-gold-premium" 
                icon={<ScissorOutlined />}
                style={{ width: "100%", height: 46 }}
              >
                Tiến hành thực hiện dịch vụ
              </Button>
            </Link>
          )}

          <Link to="/staff/appointments">
            <Button size="large" className="btn-gold-outline" style={{ height: 46 }}>
              Xem toàn bộ đặt chỗ
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
