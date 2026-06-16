import { Card, Space, Typography, Spin, Button } from "antd";
import { BellOutlined, TrophyOutlined, CalendarOutlined, StarOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { notificationsApi } from "../../api/notifications.api";
import { normalizePaginatedResponse } from "../../utils/apiResponse";
import { ErrorState } from "../../components/common/ErrorState";

const getNotificationIcon = (title: string, message: string) => {
  const t = title.toLowerCase() + " " + message.toLowerCase();
  if (t.includes("appointment") || t.includes("booking") || t.includes("lịch hẹn")) {
    return <CalendarOutlined style={{ color: "var(--color-primary)", fontSize: 16 }} />;
  }
  if (t.includes("point") || t.includes("reward") || t.includes("điểm")) {
    return <TrophyOutlined style={{ color: "#10b981", fontSize: 16 }} />;
  }
  if (t.includes("review") || t.includes("feedback") || t.includes("đánh giá")) {
    return <StarOutlined style={{ color: "#d97706", fontSize: 16 }} />;
  }
  return <BellOutlined style={{ color: "var(--color-primary-dark)", fontSize: 16 }} />;
};

export const CustomerNotificationsPage = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsApi.list(),
  });

  if (isLoading) {
    return (
      <Card bordered={false} style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Đang đọc tin nhắn..." />
      </Card>
    );
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const notificationsList = normalizePaginatedResponse(data || []).results;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
          Thông báo & Nhắc nhở của bạn
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          Cập nhật thông tin về các lịch hẹn sắp tới, quyền lợi VIP và các chương trình khuyến mãi.
        </Typography.Paragraph>
      </div>

      {notificationsList.length > 0 ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {notificationsList.map((item) => (
            <Card 
              key={item.id} 
              bordered={false} 
              style={{ 
                border: "1px solid var(--app-border)", 
                borderRadius: 12,
                background: "var(--color-surface)"
              }}
            >
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ 
                  background: "var(--color-bg)", 
                  padding: 10, 
                  borderRadius: 8, 
                  display: "grid", 
                  placeItems: "center" 
                }}>
                  {getNotificationIcon(item.title || "", item.message || "")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                      {item.title || "Thông báo"}
                    </Typography.Title>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "Hôm nay"}
                    </Typography.Text>
                  </div>
                  <Typography.Paragraph type="secondary" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    {item.message}
                  </Typography.Paragraph>
                </div>
              </div>
            </Card>
          ))}
        </Space>
      ) : (
        <Card bordered={false} style={{ textAlign: "center", padding: "60px 0", borderRadius: 16, border: "1px dashed var(--color-primary)" }}>
          <BellOutlined style={{ fontSize: 48, color: "var(--color-primary)", marginBottom: 16, opacity: 0.7 }} />
          <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, margin: "0 0 8px" }}>
            Không có thông báo
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
            Hộp thư của bạn hiện tại trống. Chúng tôi sẽ thông báo cho bạn tại đây khi có thay đổi về lịch hẹn hoặc khi bạn nhận được điểm thưởng mới!
          </Typography.Paragraph>
          <Link to="/customer/book">
            <Button type="primary" className="login-button-gold">
              Đặt lịch hẹn ngay
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};
