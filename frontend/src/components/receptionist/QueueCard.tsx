import { Button, Card, Space } from "antd";
import {
  CheckCircleOutlined,
  UserSwitchOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DollarOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { StatusBadge } from "./StatusBadge";
import type { Appointment } from "../../types/appointment";

interface QueueCardProps {
  appointment: Appointment;
  onCheckin?: (id: number | string) => void;
  onAssignStaff?: (id: number | string) => void;
  onStartService?: (id: number | string) => void;
  onEndService?: (id: number | string) => void;
  onCreateInvoice?: (id: number | string) => void;
  onCancel?: (id: number | string) => void;
  loading?: boolean;
}

export const QueueCard = ({
  appointment,
  onCheckin,
  onAssignStaff,
  onStartService,
  onEndService,
  onCreateInvoice,
  onCancel,
  loading,
}: QueueCardProps) => {
  const a = appointment;
  const customerName = a.customer_details?.full_name || `Customer #${a.customer}`;
  const customerPhone = a.customer_details?.phone || "";
  const staffName = a.employee_details?.full_name || (a.staff ? `Staff #${a.staff}` : "Unassigned");
  const serviceName = a.service_details?.name || "Service";
  const arrivalTime = a.scheduled_start ? dayjs(a.scheduled_start).format("HH:mm") : "—";

  const status = a.status;
  const canCheckin = status === "confirmed" || status === "requested";
  const canAssign = status === "arrived" || status === "confirmed";
  const canStart = status === "arrived";
  const canEnd = status === "in_service";
  const canInvoice = status === "completed";
  const canCancel = status !== "completed" && status !== "invoiced" && status !== "closed" && status !== "cancelled";

  return (
    <Card variant="borderless" className={`rcpt-queue-card status-${status}`} style={{ padding: "16px 20px" }}>
      <div className="queue-header">
        <span className="queue-code">#{a.id}</span>
        <StatusBadge status={status} />
      </div>

      <div className="queue-body">
        <div>
          <div className="label">Customer</div>
          <div style={{ fontWeight: 600 }}>{customerName}</div>
        </div>
        <div>
          <div className="label">Staff</div>
          <div>{staffName}</div>
        </div>
        {customerPhone && (
          <div>
            <div className="label"><PhoneOutlined /> Phone</div>
            <div>{customerPhone}</div>
          </div>
        )}
        <div>
          <div className="label"><ClockCircleOutlined /> Time</div>
          <div>{arrivalTime}</div>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="label">Service</div>
          <div>{serviceName}</div>
        </div>
      </div>

      <div className="queue-actions">
        <Space size={4} wrap>
          {canCheckin && (
            <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} onClick={() => onCheckin?.(a.id)} loading={loading}>
              Check-in
            </Button>
          )}
          {canAssign && (
            <Button size="small" icon={<UserSwitchOutlined />} onClick={() => onAssignStaff?.(a.id)} loading={loading}>
              Assign Staff
            </Button>
          )}
          {canStart && (
            <Button size="small" type="primary" ghost icon={<PlayCircleOutlined />} onClick={() => onStartService?.(a.id)} loading={loading}
              style={{ borderColor: "var(--rcpt-purple)", color: "var(--rcpt-purple)" }}>
              Start Service
            </Button>
          )}
          {canEnd && (
            <Button size="small" icon={<PauseCircleOutlined />} onClick={() => onEndService?.(a.id)} loading={loading}
              style={{ borderColor: "var(--rcpt-gold)", color: "var(--rcpt-gold-dark)" }}>
              End Service
            </Button>
          )}
          {canInvoice && (
            <Button size="small" type="primary" className="rcpt-btn-gold" icon={<DollarOutlined />} onClick={() => onCreateInvoice?.(a.id)} loading={loading}>
              Create Invoice
            </Button>
          )}
          {canCancel && (
            <Button size="small" danger type="text" icon={<CloseCircleOutlined />} onClick={() => onCancel?.(a.id)} loading={loading}>
              Cancel
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );
};
