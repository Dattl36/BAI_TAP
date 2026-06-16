import React from "react";
import { Card, Typography, Space, Button } from "antd";
import { 
  PlayCircleOutlined, 
  ScissorOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  PhoneOutlined,
  TagOutlined,
  GlobalOutlined,
  ShopOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { Appointment } from "../../types/appointment";
import { StatusBadge } from "./StatusBadge";

interface ActiveServiceCardProps {
  appointment: Appointment;
  onStartService: (id: string | number) => void;
  isStarting: boolean;
}

export const ActiveServiceCard: React.FC<ActiveServiceCardProps> = ({
  appointment,
  onStartService,
  isStarting,
}) => {
  const customerName = appointment.customer_details?.full_name || `Khách hàng #${appointment.customer}`;
  const customerPhone = appointment.customer_details?.phone || "—";
  const serviceName = appointment.service_details?.name || "Dịch vụ đã chọn";
  const duration = appointment.service_details?.duration || 45;
  const startTime = dayjs(appointment.scheduled_start).format("HH:mm");
  const source = appointment.source === "receptionist" ? "Lễ tân đặt" : "Khách đặt Online";
  const notes = appointment.cancellation_reason || appointment.no_show_reason || "Không có ghi chú đặc biệt.";

  return (
    <Card className="staff-active-card" bordered={false}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <Space direction="vertical" size={2}>
          <span style={{ 
            background: appointment.status === "in_service" ? "rgba(124, 58, 237, 0.1)" : "rgba(188, 163, 116, 0.1)", 
            color: appointment.status === "in_service" ? "#7c3aed" : "var(--color-primary-dark)", 
            padding: "4px 12px", 
            borderRadius: 20, 
            fontSize: 11, 
            fontWeight: 600,
            letterSpacing: "0.05em"
          }}>
            {appointment.status === "in_service" ? "PHIÊN PHỤC VỤ HIỆN TẠI" : "LỊCH HẸN TIẾP THEO"} — #{appointment.id}
          </span>
          <Typography.Title level={3} style={{ margin: "8px 0 4px", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
            {customerName}
          </Typography.Title>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--color-muted)", fontSize: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <PhoneOutlined /> {customerPhone}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {appointment.source === "receptionist" ? <ShopOutlined /> : <GlobalOutlined />} {source}
            </span>
          </div>
        </Space>
        <StatusBadge status={appointment.status} />
      </div>

      <div style={{ 
        background: "rgba(255, 255, 255, 0.8)", 
        borderRadius: 12, 
        padding: 16, 
        border: "1px solid var(--app-border)",
        marginBottom: 20
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 12 }}>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              Dịch vụ đăng ký
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: 14 }}>
              <TagOutlined style={{ marginRight: 6, color: "var(--color-primary)" }} />
              {serviceName}
            </Typography.Text>
          </div>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              Thời gian dự kiến
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: 14 }}>
              <ClockCircleOutlined style={{ marginRight: 6, color: "var(--color-primary)" }} />
              {startTime} ({duration} phút)
            </Typography.Text>
          </div>
        </div>

        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            Ghi chú từ lễ tân / Khách hàng
          </Typography.Text>
          <Typography.Text style={{ fontSize: 13, color: "var(--color-text)", fontStyle: notes === "Không có ghi chú đặc biệt." ? "italic" : "normal" }}>
            {notes}
          </Typography.Text>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {appointment.status === "arrived" ? (
          <Button 
            type="primary" 
            size="large" 
            className="btn-gold-premium" 
            icon={<PlayCircleOutlined />}
            loading={isStarting}
            onClick={() => onStartService(appointment.id)}
            style={{ flex: 1, height: 46 }}
          >
            Bắt đầu phục vụ (Seated & Ready)
          </Button>
        ) : appointment.status === "in_service" ? (
          <Link to={`/staff/executions/${appointment.id}`} style={{ flex: 1 }}>
            <Button 
              type="primary" 
              size="large" 
              className="btn-gold-premium" 
              icon={<ScissorOutlined />}
              style={{ width: "100%", height: 46 }}
            >
              Tiến hành & Hoàn thành dịch vụ
            </Button>
          </Link>
        ) : (
          <Button 
            disabled 
            size="large" 
            style={{ flex: 1, height: 46 }}
          >
            Lịch hẹn đã lên lịch (Chưa check-in)
          </Button>
        )}
        <Link to={`/staff/appointments/${appointment.id}`}>
          <Button size="large" className="btn-gold-outline" style={{ height: 46 }}>Chi tiết</Button>
        </Link>
      </div>
    </Card>
  );
};
