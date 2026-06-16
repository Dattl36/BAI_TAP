import { Tag } from "antd";

import { STATUS_COLORS, formatStatusLabel } from "../../constants/statuses";

interface StatusTagProps {
  status?: string;
}

export const StatusTag = ({ status }: StatusTagProps) => (
  <Tag 
    color={status ? STATUS_COLORS[status] ?? "default" : "default"}
    style={{ 
      borderRadius: 6, 
      fontWeight: 600, 
      fontSize: 11, 
      padding: "3px 10px", 
      border: "none",
      letterSpacing: "0.02em"
    }}
  >
    {formatStatusLabel(status)}
  </Tag>
);
