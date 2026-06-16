import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Spin, Typography, Space, Divider, Avatar } from "antd";
import { ClockCircleOutlined, CalendarOutlined, ArrowLeftOutlined } from "@ant-design/icons";

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

export const PublicServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Query service details
  const { data: service, isLoading: isServiceLoading } = useQuery({
    queryKey: ["public", "services", id],
    queryFn: () => publicApi.getServiceDetail(id || ""),
    enabled: Boolean(id),
  });

  // Query stylists
  const { data: stylistsData, isLoading: isStylistsLoading } = useQuery({
    queryKey: ["public", "stylists"],
    queryFn: () => publicApi.getStylists(),
  });

  // Query all services for related services filtering
  const { data: allServicesData } = useQuery({
    queryKey: ["public", "services"],
    queryFn: () => publicApi.getServices(),
  });

  if (isServiceLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <Spin size="large" tip="Đang tải thông tin dịch vụ..." />
      </div>
    );
  }

  if (!service) {
    return (
      <div style={{ maxWidth: 800, margin: "40px auto", textAlign: "center", padding: "40px 24px" }}>
        <Typography.Title level={3}>Không tìm thấy dịch vụ</Typography.Title>
        <Button type="primary" onClick={() => navigate("/services")} style={{ marginTop: 16 }}>
          Quay lại danh sách dịch vụ
        </Button>
      </div>
    );
  }

  const stylists = getListItems(stylistsData);
  const allServices = getListItems(allServicesData);

  // Filter 3 related services in the same category (excluding current)
  const relatedServices = allServices
    .filter((s) => s.category === service.category && String(s.id) !== String(service.id))
    .slice(0, 3);

  const handleBookService = () => {
    sessionStorage.setItem("preview_selected_service", String(service.id));
    navigate("/booking-preview");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", animation: "fadeIn 0.5s ease", width: "100%" }}>
      {/* Back button */}
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate("/services")}
        style={{ color: "var(--color-primary-dark)", padding: 0, marginBottom: 24, fontSize: 14 }}
      >
        Quay lại Bảng Giá Dịch Vụ
      </Button>

      <Row gutter={[40, 40]}>
        {/* Left column: Images & Details */}
        <Col xs={24} md={12}>
          <img
            src={getServiceImage(service.name)}
            alt={service.name}
            style={{ width: "100%", height: 380, objectFit: "cover", borderRadius: 16, boxShadow: "var(--shadow-card)" }}
          />
        </Col>

        {/* Right column: Content information */}
        <Col xs={24} md={12}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <span style={{ fontSize: 11, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "4px 12px", borderRadius: 20, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {service.category || "Tạo mẫu tóc"}
            </span>

            <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", margin: 0 }}>
              {service.name}
            </Typography.Title>

            <div style={{ display: "flex", alignItems: "center", gap: 24, margin: "8px 0" }}>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>THỜI LƯỢNG DỊCH VỤ</Typography.Text>
                <Space style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)" }}>
                  <ClockCircleOutlined /> {service.duration_minutes} phút
                </Space>
              </div>
              <Divider type="vertical" style={{ height: 40, borderColor: "var(--app-border)" }} />
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>ĐƠN GIÁ</Typography.Text>
                <strong style={{ fontSize: 20, color: "var(--color-primary-dark)" }}>
                  {Number(service.base_price).toLocaleString()} VND
                </strong>
              </div>
            </div>

            <Divider style={{ margin: "12px 0", borderColor: "var(--app-border)" }} />

            <div>
              <Typography.Title level={5} style={{ fontWeight: 600, marginBottom: 8 }}>Mô tả chi tiết</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 14, lineHeight: "1.8", whiteSpace: "pre-line" }}>
                {service.description || "Dịch vụ làm đẹp chất lượng cao tại Salon được thực hiện bởi đội ngũ kỹ thuật viên giàu kinh nghiệm, sử dụng các sản phẩm cao cấp, chính hãng giúp tóc giữ nếp lâu dài và bảo vệ cấu trúc tóc tối đa."}
              </Typography.Paragraph>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<CalendarOutlined />}
              onClick={handleBookService}
              className="login-button-gold"
              style={{ height: 48, width: "100%", maxWidth: 280, borderRadius: 8, fontSize: 15, fontWeight: 600, marginTop: 16 }}
            >
              Đặt Lịch Hẹn Dịch Vụ Này
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Suitable Stylists section */}
      <div style={{ marginTop: 60 }}>
        <Typography.Title level={3} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, marginBottom: 24 }}>
          Stylists Đề Xuất Cho Dịch Vụ Này
        </Typography.Title>
        {isStylistsLoading ? (
          <Spin />
        ) : (
          <Row gutter={[24, 24]}>
            {stylists.slice(0, 4).map((stylist) => (
              <Col xs={24} sm={12} md={6} key={stylist.id}>
                <Card style={{ borderRadius: 12, textAlign: "center" }}>
                  <Avatar
                    src={getStylistImage(Number(stylist.id), stylist.full_name)}
                    size={72}
                    style={{ marginBottom: 12, border: "2px solid var(--color-accent)" }}
                  />
                  <Typography.Title level={5} style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14 }}>
                    {stylist.full_name}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                    {stylist.specialties || "Chuyên viên tạo mẫu tóc"}
                  </Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Related Services section */}
      {relatedServices.length > 0 && (
        <div style={{ marginTop: 60 }}>
          <Typography.Title level={3} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, marginBottom: 24 }}>
            Dịch Vụ Liên Quan
          </Typography.Title>
          <Row gutter={[24, 24]}>
            {relatedServices.map((relService) => (
              <Col xs={24} sm={8} key={relService.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={relService.name}
                      src={getServiceImage(relService.name)}
                      style={{ height: 140, objectFit: "cover" }}
                    />
                  }
                  style={{ borderRadius: 12, overflow: "hidden" }}
                  onClick={() => {
                    navigate(`/services/${relService.id}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <Typography.Title level={5} style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 14 }}>
                    {relService.name}
                  </Typography.Title>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "var(--color-primary-dark)", fontSize: 13 }}>
                      {Number(relService.base_price).toLocaleString()} VND
                    </strong>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {relService.duration_minutes} phút
                    </Typography.Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};
