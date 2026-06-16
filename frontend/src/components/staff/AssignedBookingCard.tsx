import React from "react";
import { Card, Typography, Space, Button } from "antd";
import { 
  PlayCircleOutlined, 
  ScissorOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  PhoneOutlined,
  RightOutlined,
  CalendarOutlined,
  TagOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { Appointment } from "../../types/appointment";
import { StatusBadge } from "./StatusBadge";

interface AssignedBookingCardProps {
  appointment: Appointment;
  onStartService?: (id: string | number) => void;
  isStarting?: boolean;
}

export const AssignedBookingCard: React.FC<AssignedBookingCardProps> = ({
  appointment,
  onStartService,
  isStarting = false,
}) => {
  const customerName = appointment.customer_details?.full_name || `Khách hàng #${appointment.customer}`;
  const customerPhone = appointment.customer_details?.phone || "Không có SĐT";
  const serviceName = appointment.service_details?.name || "Dịch vụ đã chọn";
  const scheduledDate = dayjs(appointment.scheduled_start).format("DD/MM/YYYY");
  const scheduledTime = dayjs(appointment.scheduled_start).format("HH:mm");
  const duration = appointment.service_details?.duration || 45;
  const sourceLabel = appointment.source === "receptionist" ? "Lễ tân quầy" : "Online";

  return (
    <Card 
      bordered={false} 
      style={{ 
        borderRadius: 16, 
        border: "1px solid var(--app-border)", 
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <Space direction="vertical" size={0}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Mã đặt chỗ: <strong>#{appointment.id}</strong> ({sourceLabel})
          </Typography.Text>
          <Typography.Title level={4} style={{ margin: "4px 0 0", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
            {customerName}
          </Typography.Title>
        </Space>
        <StatusBadge status={appointment.status} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 24px", margin: "16px 0", padding: "12px 16px", background: "var(--color-bg)", borderRadius: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarOutlined style={{ color: "var(--color-primary)" }} />
          <div>
            <span style={{ fontSize: 11, color: "var(--color-muted)", display: "block" }}>Ngày</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{scheduledDate}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ClockCircleOutlined style={{ color: "var(--color-primary)" }} />
          <div>
            <span style={{ fontSize: 11, color: "var(--color-muted)", display: "block" }}>Giờ hẹn</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{scheduledTime} ({duration}m)</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PhoneOutlined style={{ color: "var(--color-primary)" }} />
          <div>
            <span style={{ fontSize: 11, color: "var(--color-muted)", display: "block" }}>Điện thoại</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{customerPhone}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          <TagOutlined style={{ color: "var(--color-primary)" }} />
          <div>
            <span style={{ fontSize: 11, color: "var(--color-muted)", display: "block" }}>Dịch vụ chính</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{serviceName}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {appointment.status === "arrived" && onStartService && (
          <Button 
            type="primary" 
            className="btn-gold-premium" 
            icon={<PlayCircleOutlined />} 
            loading={isStarting}
            onClick={() => onStartService(appointment.id)}
          >
            Bắt đầu phục vụ
          </Button>
        )}
        {appointment.status === "in_service" && (
          <Link to={`/staff/executions/${appointment.id}`}>
            <Button type="primary" className="btn-gold-premium" icon={<ScissorOutlined />}>
              Thực hiện dịch vụ
            </Button>
          </Link>
        )}
        <Link to={`/staff/appointments/${appointment.id}`}>
          <Button className="btn-gold-outline" icon={<RightOutlined />}>
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </Card>
  );
};
