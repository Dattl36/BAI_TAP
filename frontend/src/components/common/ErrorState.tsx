import { WarningOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { getErrorMessage } from "../../utils/error";

interface ErrorStateProps {
  message?: unknown;
  onRetry?: () => void;
}

export const ErrorState = ({ message = "Unable to load data.", onRetry }: ErrorStateProps) => {
  const errorString = getErrorMessage(message);

  return (
    <div 
      style={{ 
        padding: "16px 24px", 
        borderRadius: 12, 
        background: "#fff1f0", 
        border: "1px solid #ffccc7", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        gap: 16,
        margin: "12px 0"
      }}
    >
      <Space size={12}>
        <WarningOutlined style={{ color: "#ff4d4f", fontSize: 18 }} />
        <Typography.Text style={{ color: "#cf1322", fontWeight: 500, fontSize: 14 }}>
          {errorString}
        </Typography.Text>
      </Space>
      {onRetry ? (
        <Button 
          size="small" 
          onClick={onRetry}
          style={{ 
            borderRadius: 6, 
            borderColor: "#ff4d4f", 
            color: "#ff4d4f",
            fontWeight: 500 
          }}
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
};
