import { useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Row, Spin, Typography, Space, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, GiftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { publicApi } from "../../api/public.api";
import { getListItems } from "../../utils/apiResponse";

export const PublicPromotionPage = () => {
  const navigate = useNavigate();

  const { data: promotionsData, isLoading } = useQuery({
    queryKey: ["public", "promotions"],
    queryFn: () => publicApi.getPromotions(),
  });

  const promotions = getListItems(promotionsData);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return dayjs(dateStr).format("DD/MM/YYYY");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", animation: "fadeIn 0.5s ease", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <Typography.Title level={1} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: 0 }}>
          Chương Trình Khuyến Mãi
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8, fontSize: 15 }}>
          Khám phá các ưu đãi đặc quyền và chương trình giảm giá đang diễn ra tại Salon.
        </Typography.Paragraph>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}><Spin size="large" /></div>
      ) : promotions.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px 0", borderRadius: 16 }}>
          <Typography.Text type="secondary" style={{ fontSize: 16 }}>
            Hiện tại chưa có chương trình khuyến mãi nào hoạt động. Quý khách vui lòng quay lại sau!
          </Typography.Text>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {promotions.map((promo) => {
            const isPercent = promo.discount_type === "percent";
            const discountLabel = isPercent 
              ? `${Number(promo.discount_value)}%` 
              : `${Number(promo.discount_value).toLocaleString()} VND`;

            return (
              <Col xs={24} md={12} key={promo.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    borderLeft: "6px solid var(--color-primary)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={16}>
                      <Space direction="vertical" size={8}>
                        <Tag color="gold" icon={<GiftOutlined />}>ƯU ĐÃI LỚN</Tag>
                        <Typography.Title level={4} style={{ margin: "4px 0", fontWeight: 600, fontSize: 18 }}>
                          {promo.name}
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: 13, display: "block" }}>
                          {promo.description || "Chương trình ưu đãi tri ân dành riêng cho tất cả khách hàng thân thiết tại salon."}
                        </Typography.Text>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-muted)", fontSize: 12, marginTop: 8 }}>
                          <CalendarOutlined /> 
                          <span>Thời gian áp dụng: <strong>{formatDate(promo.starts_at)}</strong> - <strong>{formatDate(promo.expires_at)}</strong></span>
                        </div>
                      </Space>
                    </Col>
                    
                    <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                      <div 
                        style={{ 
                          background: "var(--color-accent)", 
                          padding: "16px 8px", 
                          borderRadius: 12,
                          border: "1px dashed var(--color-primary)",
                          marginBottom: 12
                        }}
                      >
                        <Typography.Text type="secondary" style={{ fontSize: 10, display: "block", letterSpacing: "0.05em" }}>GIẢM NGAY</Typography.Text>
                        <strong style={{ fontSize: 22, color: "var(--color-primary-dark)", fontFamily: "'Outfit', sans-serif" }}>
                          {discountLabel}
                        </strong>
                      </div>
                      
                      <Button
                        type="primary"
                        onClick={() => navigate("/booking-preview")}
                        className="login-button-gold"
                        style={{ width: "100%", borderRadius: 6 }}
                      >
                        Đặt lịch ngay
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};
