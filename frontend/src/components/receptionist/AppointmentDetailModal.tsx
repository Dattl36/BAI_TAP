import { Modal, Descriptions, Button, Space, Divider } from "antd";
import {
  CheckCircleOutlined,
  UserSwitchOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DollarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { AppointmentStatusFlow } from "./AppointmentStatusFlow";
import { StatusBadge } from "./StatusBadge";
import type { Appointment } from "../../types/appointment";

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onCheckin?: (id: number | string) => void;
  onAssignStaff?: (id: number | string) => void;
  onStartService?: (id: number | string) => void;
  onEndService?: (id: number | string) => void;
  onCreateInvoice?: (id: number | string) => void;
  onCancel?: (id: number | string) => void;
  loading?: boolean;
}

export const AppointmentDetailModal = ({
  appointment,
  open,
  onClose,
  onCheckin,
  onAssignStaff,
  onStartService,
  onEndService,
  onCreateInvoice,
  onCancel,
  loading,
}: AppointmentDetailModalProps) => {
  if (!appointment) return null;

  const a = appointment;
  const status = a.status;
  const customerName = a.customer_details?.full_name || `Customer #${a.customer}`;
  const customerPhone = a.customer_details?.phone || "—";
  const staffName = a.employee_details?.full_name || (a.staff ? `Staff #${a.staff}` : "Unassigned");
  const serviceName = a.service_details?.name || "Service";

  const canCheckin = status === "confirmed" || status === "requested";
  const canAssign = status === "arrived" || status === "confirmed";
  const canStart = status === "arrived";
  const canEnd = status === "in_service";
  const canInvoice = status === "completed";
  const canCancel = status !== "completed" && status !== "invoiced" && status !== "closed" && status !== "cancelled";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
            Appointment #{a.id}
          </span>
          <StatusBadge status={status} />
        </div>
      }
      footer={null}
      width={640}
    >
      <AppointmentStatusFlow currentStatus={status} />

      <Divider style={{ margin: "12px 0 16px" }} />

      <Descriptions
        bordered
        column={1}
        size="small"
        labelStyle={{ fontWeight: 600, width: 160, background: "#faf8f5" }}
        contentStyle={{ background: "#fff" }}
      >
        <Descriptions.Item label="Customer">{customerName}</Descriptions.Item>
        <Descriptions.Item label="Phone">{customerPhone}</Descriptions.Item>
        <Descriptions.Item label="Service">{serviceName}</Descriptions.Item>
        <Descriptions.Item label="Staff">{staffName}</Descriptions.Item>
        <Descriptions.Item label="Scheduled Start">
          {a.scheduled_start ? dayjs(a.scheduled_start).format("YYYY-MM-DD HH:mm") : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Scheduled End">
          {a.scheduled_end ? dayjs(a.scheduled_end).format("YYYY-MM-DD HH:mm") : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Source">
          {a.source === "receptionist" ? "Walk-in / Desk" : "Online Booking"}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: "16px 0 12px" }} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Space>
          {canCheckin && (
            <Button icon={<CheckCircleOutlined />} onClick={() => { onCheckin?.(a.id); onClose(); }} loading={loading}
              style={{ borderColor: "var(--rcpt-success)", color: "var(--rcpt-success)" }}>
              Check-in
            </Button>
          )}
          {canAssign && (
            <Button icon={<UserSwitchOutlined />} onClick={() => { onAssignStaff?.(a.id); onClose(); }} loading={loading}>
              Assign Staff
            </Button>
          )}
          {canStart && (
            <Button icon={<PlayCircleOutlined />} onClick={() => { onStartService?.(a.id); onClose(); }} loading={loading}
              style={{ borderColor: "var(--rcpt-purple)", color: "var(--rcpt-purple)" }}>
              Start Service
            </Button>
          )}
          {canEnd && (
            <Button icon={<PauseCircleOutlined />} onClick={() => { onEndService?.(a.id); onClose(); }} loading={loading}
              style={{ borderColor: "var(--rcpt-gold)", color: "var(--rcpt-gold-dark)" }}>
              End Service
            </Button>
          )}
          {canInvoice && (
            <Button type="primary" className="rcpt-btn-gold" icon={<DollarOutlined />}
              onClick={() => { onCreateInvoice?.(a.id); onClose(); }} loading={loading}>
              Create Invoice
            </Button>
          )}
          {canCancel && (
            <Button danger icon={<CloseCircleOutlined />} onClick={() => { onCancel?.(a.id); onClose(); }} loading={loading}>
              Cancel
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
};
