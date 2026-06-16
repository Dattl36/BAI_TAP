import React from "react";
import { Alert, Button, Space, Typography } from "antd";
import { WarningOutlined, RedoOutlined } from "@ant-design/icons";
import { getErrorMessage } from "../../utils/error";

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
  message?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  message = "Đã xảy ra lỗi khi tải dữ liệu",
}) => {
  const errMsg = getErrorMessage(error);

  return (
    <div style={{ margin: "16px 0" }}>
      <Alert
        message={
          <Typography.Text strong style={{ color: "#7f1d1d" }}>
            {message}
          </Typography.Text>
        }
        description={
          <Space direction="vertical" size={8} style={{ width: "100%", marginTop: 4 }}>
            <Typography.Text type="secondary" style={{ fontSize: 13, color: "#991b1b" }}>
              {errMsg}
            </Typography.Text>
            {onRetry && (
              <Button 
                type="primary" 
                danger 
                size="small" 
                icon={<RedoOutlined />} 
                onClick={onRetry}
                style={{ borderRadius: 6 }}
              >
                Thử lại
              </Button>
            )}
          </Space>
        }
        type="error"
        showIcon
        icon={<WarningOutlined style={{ color: "#dc2626" }} />}
        style={{
          borderRadius: 12,
          backgroundColor: "#fef2f2",
          border: "1px solid #fca5a5"
        }}
      />
    </div>
  );
};
