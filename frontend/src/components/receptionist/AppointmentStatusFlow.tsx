import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { AppointmentStatus } from "../../types/appointment";

const FLOW_STEPS: { key: AppointmentStatus; label: string }[] = [
  { key: "requested", label: "Requested" },
  { key: "confirmed", label: "Confirmed" },
  { key: "arrived", label: "Checked-in" },
  { key: "in_service", label: "In Service" },
  { key: "completed", label: "Awaiting Pay" },
  { key: "invoiced", label: "Paid" },
];

const STEP_ORDER: Record<string, number> = {};
FLOW_STEPS.forEach((s, i) => { STEP_ORDER[s.key] = i; });

interface AppointmentStatusFlowProps {
  currentStatus: AppointmentStatus;
}

export const AppointmentStatusFlow = ({ currentStatus }: AppointmentStatusFlowProps) => {
  const isCancelled = currentStatus === "cancelled" || currentStatus === "no_show";
  const currentIdx = STEP_ORDER[currentStatus] ?? -1;

  return (
    <div className="rcpt-status-flow">
      {FLOW_STEPS.map((step, idx) => {
        const isCompleted = !isCancelled && idx < currentIdx;
        const isCurrent = !isCancelled && idx === currentIdx;

        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", flex: idx < FLOW_STEPS.length - 1 ? 1 : undefined }}>
            <div className="flow-step">
              <div className={`flow-dot ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isCancelled && idx === 0 ? "cancelled" : ""}`}>
                {isCompleted ? <CheckOutlined style={{ fontSize: 11 }} /> :
                  isCancelled && idx === 0 ? <CloseOutlined style={{ fontSize: 11 }} /> :
                  <span style={{ fontSize: 10 }}>{idx + 1}</span>}
              </div>
              <span className={`flow-label ${isCurrent ? "current" : ""}`}>{step.label}</span>
            </div>
            {idx < FLOW_STEPS.length - 1 && (
              <div className={`flow-connector ${isCompleted ? "completed" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
