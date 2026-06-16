import React from "react";
import { Modal, Descriptions, Button, Space, Divider, Typography } from "antd";
import { 
  PlayCircleOutlined, 
  ScissorOutlined, 
  CalendarOutlined, 
  PhoneOutlined, 
  UserOutlined,
  TagOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { Appointment } from "../../types/appointment";
import { StatusBadge } from "./StatusBadge";

interface BookingDetailModalProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onStartService?: (id: string | number) => void;
  isStarting?: boolean;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  appointment,
  open,
  onClose,
  onStartService,
  isStarting = false,
}) => {
  if (!appointment) return null;

  const customerName = appointment.customer_details?.full_name || `Khách hàng #${appointment.customer}`;
  const customerPhone = appointment.customer_details?.phone || "Không có SĐT";
  const customerEmail = appointment.customer_details?.email || "Không có email";
  const serviceName = appointment.service_details?.name || "Dịch vụ đã chọn";
  const servicePrice = appointment.service_details?.price || 0;
  const duration = appointment.service_details?.duration || 45;
  const startTime = dayjs(appointment.scheduled_start).format("DD/MM/YYYY HH:mm");
  const endTime = dayjs(appointment.scheduled_end).format("HH:mm");
  const notes = appointment.cancellation_reason || appointment.no_show_reason || "Không có ghi chú.";
  const source = appointment.source === "receptionist" ? "Lễ tân quầy đặt trực tiếp" : "Khách hàng đặt Online";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Chi tiết lịch đặt chỗ #{appointment.id}
        </Typography.Title>
      }
      footer={[
        <Button key="close" onClick={onClose} style={{ borderRadius: 8 }}>
          Đóng
        </Button>,
        appointment.status === "arrived" && onStartService && (
          <Button 
            key="start"
            type="primary" 
            className="btn-gold-premium" 
            icon={<PlayCircleOutlined />} 
            loading={isStarting}
            onClick={() => {
              onStartService(appointment.id);
              onClose();
            }}
          >
            Bắt đầu phục vụ
          </Button>
        ),
        appointment.status === "in_service" && (
          <Link key="stepper" to={`/staff/executions/${appointment.id}`} onClick={onClose}>
            <Button type="primary" className="btn-gold-premium" icon={<ScissorOutlined />}>
              Thực hiện dịch vụ
            </Button>
          </Link>
        )
      ]}
      width={600}
      style={{ borderRadius: 16, overflow: "hidden" }}
    >
      <div style={{ margin: "20px 0 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Space direction="vertical" size={2}>
            <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Trạng thái hiện tại</span>
            <StatusBadge status={appointment.status} />
          </Space>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 12, color: "var(--color-muted)", display: "block" }}>Nguồn tạo</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{source}</span>
          </div>
        </div>

        <Descriptions title="Thông tin khách hàng" column={1} bordered size="small" labelStyle={{ fontWeight: 600, width: 180 }}>
          <Descriptions.Item label="Họ và tên">
            <UserOutlined style={{ marginRight: 6, color: "var(--color-primary)" }} /> {customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            <PhoneOutlined style={{ marginRight: 6, color: "var(--color-primary)" }} /> {customerPhone}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ Email">
            {customerEmail}
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: "16px 0" }} />

        <Descriptions title="Thông tin dịch vụ & Thời gian" column={1} bordered size="small" labelStyle={{ fontWeight: 600, width: 180 }}>
          <Descriptions.Item label="Khung giờ hẹn">
            <CalendarOutlined style={{ marginRight: 6, color: "var(--color-primary)" }} />
            {startTime} - {endTime} ({duration} phút)
          </Descriptions.Item>
          <Descriptions.Item label="Dịch vụ chính">
            <TagOutlined style={{ marginRight: 6, color: "var(--color-primary)" }} />
            {serviceName}
          </Descriptions.Item>
          <Descriptions.Item label="Chi phí dịch vụ (dự kiến)">
            <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(servicePrice)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú nội bộ / yêu cầu">
            {notes}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};
