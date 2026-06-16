import { LoadingOutlined } from "@ant-design/icons";
import { Space, Spin, Typography } from "antd";

export const PageLoading = () => (
  <div style={{ display: "grid", minHeight: 320, placeItems: "center" }}>
    <Space direction="vertical" align="center" size={16}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 40, color: "var(--color-primary)" }} spin />} 
      />
      <Typography.Text type="secondary" style={{ fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        Elevating Workspace...
      </Typography.Text>
    </Space>
  </div>
);
