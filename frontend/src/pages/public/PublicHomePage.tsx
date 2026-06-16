import { useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Row, Spin, Typography, Space, Rate, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowRightOutlined, CalendarOutlined } from "@ant-design/icons";

import { publicApi } from "../../api/public.api";
import { getListItems } from "../../utils/apiResponse";

const getServiceImage = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("cut") || n.includes("style")) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=60";
  }
  if (n.includes("wash") || n.includes("shampoo") || n.includes("treatment")) {
    return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60";
  }
  if (n.includes("nail") || n.includes("manicure") || n.includes("pedicure")) {
    return "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=60";
  }
  return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60";
};

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

export const PublicHomePage = () => {
  const navigate = useNavigate();

  // Queries
  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ["public", "services", "featured"],
    queryFn: () => publicApi.getServices({ page_size: 3 }),
  });

  const { data: stylistsData, isLoading: isStylistsLoading } = useQuery({
    queryKey: ["public", "stylists", "featured"],
    queryFn: () => publicApi.getStylists({ page_size: 3 }),
  });

  const { data: articlesData } = useQuery({
    queryKey: ["public", "articles"],
    queryFn: () => publicApi.getArticles(),
  });

  const featuredServices = getListItems(servicesData);
  const featuredStylists = getListItems(stylistsData);
  const articlesList = getListItems(articlesData);

  return (
    <div style={{ animation: "fadeIn 0.5s ease", width: "100%" }}>
      {/* Hero Banner Section */}
      <div
        style={{
          backgroundImage: "linear-gradient(rgba(20, 20, 18, 0.65), rgba(20, 20, 18, 0.8)), url('https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1470&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "75vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#ffffff",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <Typography.Title
          style={{
            color: "var(--color-primary)",
            fontFamily: "'Playfair Display', serif",
            fontSize: "48px",
            fontWeight: 400,
            margin: "0 0 16px",
            letterSpacing: "0.05em",
          }}
        >
          Trải Nghiệm Sự Khác Biệt
        </Typography.Title>
        <Typography.Title
          level={2}
          style={{
            color: "#ffffff",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "24px",
            fontWeight: 300,
            maxWidth: 700,
            margin: "0 0 32px",
            lineHeight: "1.6",
          }}
        >
          Nơi vẻ đẹp tự nhiên của bạn được nâng tầm bởi bàn tay của các chuyên gia tạo mẫu hàng đầu.
        </Typography.Title>
        <Space size={20}>
          <Button
            type="primary"
            size="large"
            icon={<CalendarOutlined />}
            onClick={() => navigate("/booking-preview")}
            className="login-button-gold"
            style={{ height: 48, padding: "0 32px", fontSize: 16, borderRadius: 8 }}
          >
            Đặt Lịch Hẹn Ngay
          </Button>
          <Button
            type="default"
            ghost
            size="large"
            onClick={() => navigate("/services")}
            style={{ height: 48, padding: "0 32px", fontSize: 16, borderRadius: 8, borderColor: "#ffffff", color: "#ffffff" }}
          >
            Xem Dịch Vụ
          </Button>
        </Space>
      </div>

      {/* Featured Services Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <span style={{ fontSize: 12, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "4px 12px", borderRadius: 20, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Dịch Vụ Của Chúng Tôi
          </span>
          <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: "12px 0 0" }}>
            Dịch Vụ Nổi Bật
          </Typography.Title>
          <div style={{ width: 40, height: 3, background: "var(--color-primary)", margin: "16px auto 0", borderRadius: 2 }} />
        </div>

        {isServicesLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}><Spin size="large" /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {featuredServices.map((service) => (
              <Col xs={24} md={8} key={service.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={service.name}
                      src={getServiceImage(service.name)}
                      style={{ height: 220, objectFit: "cover" }}
                    />
                  }
                  style={{ borderRadius: 16, overflow: "hidden" }}
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  <span style={{ fontSize: 10, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "2px 8px", borderRadius: 10, fontWeight: 600, textTransform: "uppercase" }}>
                    {service.category || "Tạo mẫu tóc"}
                  </span>
                  <Typography.Title level={4} style={{ margin: "10px 0 8px", fontWeight: 600, fontSize: 18 }}>
                    {service.name}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 13, display: "block", minHeight: 40, marginBottom: 16 }}>
                    {service.description || "Hãy trải nghiệm dịch vụ chăm sóc tóc cao cấp được thiết kế riêng cho bạn."}
                  </Typography.Text>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--app-border)", paddingTop: 12 }}>
                    <strong style={{ color: "var(--color-primary-dark)", fontSize: 16 }}>
                      {Number(service.base_price).toLocaleString()} VND
                    </strong>
                    <Button type="link" style={{ color: "var(--color-primary)", fontWeight: 600, padding: 0 }}>
                      Xem chi tiết <ArrowRightOutlined />
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Styled Banner Promo */}
      <div
        style={{
          background: "#1c1b18",
          padding: "60px 40px",
          color: "#ffffff",
          textAlign: "center",
          borderTop: "1px solid var(--color-primary)",
          borderBottom: "1px solid var(--color-primary)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Typography.Title level={3} style={{ color: "var(--color-primary)", fontFamily: "'Playfair Display', serif", margin: "0 0 12px" }}>
            ĐĂNG KÝ HỘI VIÊN - NHẬN NGAY ƯU ĐÃI
          </Typography.Title>
          <Typography.Paragraph style={{ color: "#a3a19c", fontSize: 15, marginBottom: 24 }}>
            Tích lũy điểm thưởng khi sử dụng dịch vụ và đổi lấy các voucher giảm giá cực kỳ hấp dẫn. Đăng ký tài khoản để bắt đầu trải nghiệm đặc quyền hội viên ngay hôm nay!
          </Typography.Paragraph>
          <Button
            type="primary"
            onClick={() => navigate("/register")}
            className="login-button-gold"
            style={{ height: 44, padding: "0 30px", fontWeight: 600 }}
          >
            Đăng Ký Tài Khoản
          </Button>
        </div>
      </div>

      {/* Stylists Spotlight Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <span style={{ fontSize: 12, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "4px 12px", borderRadius: 20, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Đội Ngũ Nhân Viên
          </span>
          <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: "12px 0 0" }}>
            Chuyên Viên Tạo Mẫu Tóc Xuất Sắc
          </Typography.Title>
          <div style={{ width: 40, height: 3, background: "var(--color-primary)", margin: "16px auto 0", borderRadius: 2 }} />
        </div>

        {isStylistsLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}><Spin size="large" /></div>
        ) : (
          <Row gutter={[32, 32]} justify="center">
            {featuredStylists.map((stylist) => (
              <Col xs={24} sm={12} md={8} key={stylist.id}>
                <Card
                  hoverable
                  style={{ textAlign: "center", borderRadius: 16 }}
                  cover={
                    <div style={{ display: "flex", justifyContent: "center", paddingTop: 24 }}>
                      <Avatar
                        src={getStylistImage(Number(stylist.id), stylist.full_name)}
                        size={120}
                        style={{ border: "3px solid var(--color-accent)" }}
                      />
                    </div>
                  }
                >
                  <Typography.Title level={4} style={{ margin: "12px 0 4px", fontWeight: 600 }}>
                    {stylist.full_name}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
                    {stylist.specialties || "Chuyên viên tạo mẫu tóc cao cấp"}
                  </Typography.Text>
                  <div style={{ borderTop: "1px solid var(--app-border)", paddingTop: 12, marginTop: 12 }}>
                    <Rate disabled defaultValue={5} style={{ fontSize: 14, color: "var(--color-primary)" }} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Customer Testimonials Section */}
      <div style={{ background: "var(--color-surface)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span style={{ fontSize: 12, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "4px 12px", borderRadius: 20, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Đánh Giá
            </span>
            <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: "12px 0 0" }}>
              Khách Hàng Nói Gì Về Chúng Tôi
            </Typography.Title>
            <div style={{ width: 40, height: 3, background: "var(--color-primary)", margin: "16px auto 0", borderRadius: 2 }} />
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ background: "var(--color-bg)", borderRadius: 16 }}>
                <Rate disabled defaultValue={5} style={{ fontSize: 14, color: "var(--color-primary)", marginBottom: 12 }} />
                <p style={{ fontStyle: "italic", fontSize: 14, lineHeight: "1.6" }}>
                  "Dịch vụ ở đây thật sự đỉnh cao. Nhân viên cắt tóc rất có tâm, tư vấn kiểu tóc rất hợp với khuôn mặt mình. Không gian thì vô cùng thư giãn, sang trọng!"
                </p>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar style={{ backgroundColor: "var(--color-primary)" }}>M</Avatar>
                  <strong>Nguyễn Hoàng Minh</strong>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ background: "var(--color-bg)", borderRadius: 16 }}>
                <Rate disabled defaultValue={5} style={{ fontSize: 14, color: "var(--color-primary)", marginBottom: 12 }} />
                <p style={{ fontStyle: "italic", fontSize: 14, lineHeight: "1.6" }}>
                  "Mình nhuộm tóc tại đây và rất hài lòng với màu tóc mới. Tóc nhuộm xong không hề bị khô xơ mà rất mềm mượt. Stylist Elena làm cực kỳ chuyên nghiệp."
                </p>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar style={{ backgroundColor: "var(--color-primary)" }}>A</Avatar>
                  <strong>Trần Thu An</strong>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ background: "var(--color-bg)", borderRadius: 16 }}>
                <Rate disabled defaultValue={5} style={{ fontSize: 14, color: "var(--color-primary)", marginBottom: 12 }} />
                <p style={{ fontStyle: "italic", fontSize: 14, lineHeight: "1.6" }}>
                  "Đặt lịch hẹn trước qua app cực kỳ nhanh chóng và tiện lợi. Đến nơi là được làm luôn không phải đợi. Dịch vụ gội đầu dưỡng sinh vô cùng thư giãn."
                </p>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar style={{ backgroundColor: "var(--color-primary)" }}>H</Avatar>
                  <strong>Phan Quốc Huy</strong>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Hair Care Articles Section */}
      {articlesList.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span style={{ fontSize: 12, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "4px 12px", borderRadius: 20, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Cẩm Nang Làm Đẹp
            </span>
            <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: "12px 0 0" }}>
              Bí Quyết Chăm Sóc Tóc Từ Chuyên Gia
            </Typography.Title>
            <div style={{ width: 40, height: 3, background: "var(--color-primary)", margin: "16px auto 0", borderRadius: 2 }} />
          </div>

          <Row gutter={[24, 24]}>
            {articlesList.map((article) => (
              <Col xs={24} md={8} key={article.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={article.title}
                      src={article.image_url}
                      style={{ height: 180, objectFit: "cover" }}
                    />
                  }
                  style={{ borderRadius: 16, overflow: "hidden" }}
                >
                  <Space style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 10, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "2px 6px", borderRadius: 10, fontWeight: 600 }}>
                      {article.category}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-muted)" }}>
                      {article.read_time}
                    </span>
                  </Space>
                  <Typography.Title level={5} style={{ margin: "4px 0 8px", fontWeight: 600, fontSize: 16, lineHeight: "1.4" }}>
                    {article.title}
                  </Typography.Title>
                  <p style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: "1.6", margin: "0 0 12px" }}>
                    {article.summary}
                  </p>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                    Đăng bởi {article.author} ngày {article.published_at}
                  </Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};
