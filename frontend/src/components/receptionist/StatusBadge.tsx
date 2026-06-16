import { formatStatusLabel } from "../../constants/statuses";

interface StatusBadgeProps {
  status?: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`rcpt-status-badge status-${status || "unknown"}`}>
    {formatStatusLabel(status)}
  </span>
);
