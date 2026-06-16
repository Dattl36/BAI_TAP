import { Empty, Typography } from "antd";

interface EmptyStateProps {
  description?: string;
}

export const EmptyState = ({ description = "No active records found." }: EmptyStateProps) => (
  <div style={{ padding: "40px 0", display: "grid", placeItems: "center" }}>
    <Empty 
      image={Empty.PRESENTED_IMAGE_SIMPLE} 
      description={
        <Typography.Text style={{ color: "var(--color-muted)", fontSize: 14 }}>
          {description}
        </Typography.Text>
      } 
    />
  </div>
);
