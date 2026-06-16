import React from "react";
import { Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";

interface EmptyStateProps {
  message?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "Trống",
  description = "Không tìm thấy dữ liệu nào cho phần này.",
}) => {
  return (
    <div className="stylist-empty-state">
      <InboxOutlined className="stylist-empty-icon" />
      <Typography.Title level={4} style={{ margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>
        {message}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        {description}
      </Typography.Text>
    </div>
  );
};
