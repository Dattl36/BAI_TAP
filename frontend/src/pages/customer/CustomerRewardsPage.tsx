import { Card, Space, Typography, Timeline, Progress } from "antd";
import { TrophyOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useCustomerHomeData } from "../../hooks/queries/useCustomerHomeData";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";

export const CustomerRewardsPage = () => {
  const {
    isLoading,
    isError,
    error,
    currentPoints,
    loyaltyTier,
    tierProgress,
    pointsAway,
    nextTierPoints,
    rewardsHistory,
    refetch,
  } = useCustomerHomeData();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
          Câu lạc bộ thành viên
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          Tích lũy điểm qua mỗi lần làm đẹp và đổi điểm thành chiết khấu trực tiếp trên hóa đơn.
        </Typography.Paragraph>
      </div>

      <Card 
        bordered={false} 
        style={{ 
          background: "linear-gradient(135deg, #1f1d1a 0%, #141412 100%)",
          color: "#ffffff",
          borderRadius: 20,
          marginBottom: 32,
          padding: 16
        }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space direction="vertical" size={4}>
              <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 500 }}>HẠNG THÀNH VIÊN HIỆN TẠI</span>
              <Typography.Title level={2} style={{ margin: 0, color: "#ffffff", fontFamily: "'Outfit', sans-serif" }}>
                {loyaltyTier}
              </Typography.Title>
            </Space>
            <TrophyOutlined style={{ fontSize: 48, color: "var(--color-primary)" }} />
          </div>

          <Progress percent={tierProgress} size="small" strokeColor="#bca374" trailColor="#33312e" />
          
          <div style={{ display: "flex", justifyContent: "space-between", color: "#a3a19c", fontSize: 13 }}>
            <span>Số dư khả dụng: <strong>{currentPoints} Điểm</strong></span>
            {pointsAway > 0 ? (
              <span>Mục tiêu tiếp theo: {nextTierPoints} Điểm (Còn {pointsAway} điểm)</span>
            ) : (
              <span>Đã đạt hạng Bạch Kim cao nhất</span>
            )}
          </div>
        </Space>
      </Card>

      <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginBottom: 20 }}>
        Lịch sử giao dịch điểm
      </Typography.Title>

      <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}>
        {rewardsHistory.length > 0 ? (
          <Timeline style={{ marginTop: 16 }}>
            {rewardsHistory.map((item) => (
              <Timeline.Item 
                key={item.id}
                dot={
                  item.movement_type === "earn" || item.movement_type === "adjust"
                    ? <PlusOutlined style={{ color: "#10b981", fontSize: 14 }} />
                    : <MinusOutlined style={{ color: "#ef4444", fontSize: 14 }} />
                }
                label={<span style={{ color: "var(--color-muted)" }}>{item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "Chưa xác định"}</span>}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography.Text style={{ fontWeight: 500 }}>
                    {item.reason || `${item.movement_type === "earn" ? "Tích lũy điểm thưởng" : "Sử dụng điểm giảm giá"} hóa đơn #INV-${item.invoice || ""}`}
                  </Typography.Text>
                  <strong style={{ color: item.movement_type === "earn" || item.movement_type === "adjust" ? "#10b981" : "#ef4444", fontSize: 14 }}>
                    {item.movement_type === "earn" || item.movement_type === "adjust" ? "+" : "-"}{Math.abs(item.points)} điểm
                  </strong>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <EmptyState description="Chưa có lịch sử giao dịch điểm nào." />
        )}
      </Card>
    </div>
  );
};
