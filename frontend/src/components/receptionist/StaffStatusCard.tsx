import { Card } from "antd";

interface StaffStatusCardProps {
  name: string;
  specialty?: string;
  status: "available" | "busy" | "on-break" | "off";
  currentTask?: string;
}

export const StaffStatusCard = ({ name, specialty, status, currentTask }: StaffStatusCardProps) => {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Card variant="borderless" className="rcpt-staff-card" style={{ padding: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
        <div className="staff-avatar">{initials}</div>
        <div className="staff-info">
          <div className="staff-name">{name}</div>
          <div className="staff-task">
            {status === "busy" && currentTask ? currentTask : specialty || status.replace("-", " ")}
          </div>
        </div>
        <div className={`staff-dot ${status}`} title={status.replace("-", " ")} />
      </div>
    </Card>
  );
};
