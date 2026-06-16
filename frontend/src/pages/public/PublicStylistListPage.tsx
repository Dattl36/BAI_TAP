import { useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Row, Spin, Typography, Rate, Avatar, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { StarOutlined, CalendarOutlined } from "@ant-design/icons";

import { publicApi } from "../../api/public.api";
import { getListItems } from "../../utils/apiResponse";

const getStylistImage = (id: number, name: string) => {
  const n = name.toLowerCase();
  if (n.includes("elena") || id === 1) {
    return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60";
  }
  if (n.includes("marcus") || id === 2) {
    return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60";
  }
  return "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60";
};

export const PublicStylistListPage = () => {
  const navigate = useNavigate();

  const { data: stylistsData, isLoading } = useQuery({
    queryKey: ["public", "stylists"],
    queryFn: () => publicApi.getStylists(),
  });

  const stylists = getListItems(stylistsData);

  const handleSelectStylist = (stylistId: string | number) => {
    sessionStorage.setItem("preview_selected_stylist", String(stylistId));
    navigate("/booking-preview");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", animation: "fadeIn 0.5s ease", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <Typography.Title level={1} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: 0 }}>
          Đội Ngũ Stylists
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8, fontSize: 15 }}>
          Gặp gỡ những chuyên gia tạo mẫu tóc tài năng và tâm huyết hàng đầu của chúng tôi.
        </Typography.Paragraph>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}><Spin size="large" /></div>
      ) : stylists.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px 0", borderRadius: 16 }}>
          <Typography.Text type="secondary" style={{ fontSize: 16 }}>
            Hiện tại chưa cập nhật danh sách Stylists. Xin vui lòng quay lại sau!
          </Typography.Text>
        </Card>
      ) : (
        <Row gutter={[32, 32]}>
          {stylists.map((stylist) => (
            <Col xs={24} sm={12} md={8} key={stylist.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  textAlign: "center",
                  paddingBottom: 8,
                }}
                cover={
                  <div style={{ display: "flex", justifyContent: "center", paddingTop: 32, background: "linear-gradient(rgba(188, 163, 116, 0.05), transparent)" }}>
                    <Avatar
                      src={getStylistImage(Number(stylist.id), stylist.full_name)}
                      size={130}
                      style={{
                        border: "3px solid var(--color-primary)",
                        boxShadow: "0 4px 15px rgba(188, 163, 116, 0.2)",
                      }}
                    />
                  </div>
                }
              >
                <Typography.Title level={4} style={{ margin: "16px 0 4px", fontWeight: 600 }}>
                  {stylist.full_name}
                </Typography.Title>
                
                <span 
                  style={{ 
                    fontSize: 11, 
                    background: "var(--color-accent)", 
                    color: "var(--color-primary-dark)", 
                    padding: "2px 10px", 
                    borderRadius: 12, 
                    fontWeight: 600,
                    display: "inline-block",
                    marginBottom: 16
                  }}
                >
                  Stylist Chuyên Nghiệp
                </span>

                <Typography.Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 13, 
                    display: "block", 
                    minHeight: 38, 
                    marginBottom: 20,
                    lineHeight: "1.6"
                  }}
                >
                  Kinh nghiệm dày dặn trong việc: <strong style={{ color: "var(--color-text)" }}>{stylist.specialties || "Cắt tóc nam nữ, nhuộm màu thời trang, uốn tóc bồng bềnh."}</strong>
                </Typography.Text>

                <div 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    gap: 16, 
                    borderTop: "1px solid var(--app-border)", 
                    paddingTop: 16 
                  }}
                >
                  <Space size={4}>
                    <Rate disabled defaultValue={5} style={{ fontSize: 14, color: "var(--color-primary)" }} />
                    <span style={{ fontSize: 12, color: "var(--color-muted)", marginLeft: 4 }}>(4.9)</span>
                  </Space>
                  
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    onClick={() => handleSelectStylist(stylist.id)}
                    className="login-button-gold"
                    style={{ width: "100%", height: 38, borderRadius: 8, fontWeight: 600 }}
                  >
                    Chọn Stylist này
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
