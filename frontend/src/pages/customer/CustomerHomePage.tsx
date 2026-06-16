import { CalendarOutlined, TrophyOutlined, GiftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Typography, Space, Progress } from "antd";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useCustomerHomeData } from "../../hooks/queries/useCustomerHomeData";
import { useMe } from "../../hooks/useMe";
import { servicesApi } from "../../api/services.api";
import { normalizePaginatedResponse } from "../../utils/apiResponse";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";

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

export const CustomerHomePage = () => {
  const { data: user } = useMe();
  const {
    isLoading: isHomeLoading,
    isError: isHomeError,
    error: homeError,
    nextAppointment,
    activeVouchers,
    currentPoints,
    loyaltyTier,
    tierProgress,
    pointsAway,
    nextTierPoints,
    refetch,
  } = useCustomerHomeData();

  // Fetch recommended services
  const { data: servicesData, isLoading: servicesLoading, isError: isServicesError, error: servicesError } = useQuery({
    queryKey: ["services", "list"],
    queryFn: () => servicesApi.list(),
  });

  const isLoading = isHomeLoading || servicesLoading;
  const isError = isHomeError || isServicesError;
  const error = homeError || servicesError;

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const welcomeName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ""}` 
    : (user?.username || "Khách hàng");

  const servicesList = normalizePaginatedResponse(servicesData || []).results.slice(0, 3);

  // Dynamic formatting helpers
  const mapStatusToVietnamese = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending" || s === "requested") return "CHỜ XÁC NHẬN";
    if (s === "confirmed") return "ĐÃ XÁC NHẬN";
    if (s === "completed") return "ĐÃ HOÀN THÀNH";
    if (s === "cancelled") return "ĐÃ HỦY";
    if (s === "no_show") return "KHÔNG ĐẾN";
    return status.toUpperCase();
  };

  const formatAppointmentDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Chưa xác định";
    const weekdays = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy"
    ];
    const weekday = weekdays[d.getDay()];
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${weekday}, ${day}/${month}/${year}`;
  };

  const formatShortTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDiscountLabel = (discountType: string, discountValue: number | string) => {
    const val = Number(discountValue);
    if (discountType === "percent") {
      const formattedVal = val % 1 === 0 ? val.toFixed(0) : val.toString();
      return `Giảm ${formattedVal}%`;
    } else {
      return `Giảm ${val.toLocaleString("vi-VN")} VNĐ`;
    }
  };

  const formatMinInvoice = (minInvoice: number | string | null | undefined) => {
    const val = Number(minInvoice || 0);
    return `Hóa đơn tối thiểu: ${val.toLocaleString("vi-VN")} VNĐ`;
  };

  const formatExpirationDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "HSD: Vô thời hạn";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "HSD: Vô thời hạn";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `HSD: ${day}/${month}/${year}`;
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Welcome & Reward Panel */}
      <Card 
        bordered={false} 
        style={{ 
          background: "linear-gradient(135deg, #1f1d1a 0%, #141412 100%)",
          color: "#ffffff",
          borderRadius: 20,
          marginBottom: 32,
          padding: 8
        }}
      >
        <Row align="middle" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Typography.Title level={2} style={{ margin: 0, color: "#faf7f2", fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              Chào mừng quay lại, {welcomeName}
            </Typography.Title>
            <Typography.Paragraph style={{ marginTop: 8, color: "#a3a19c", fontSize: 14 }}>
              Không gian chăm sóc sắc đẹp của bạn đã sẵn sàng. Đặt lịch hẹn mới hoặc theo dõi quyền lợi thành viên của bạn.
            </Typography.Paragraph>
            <Link to="/customer/book">
              <Button type="primary" size="large" className="login-button-gold" icon={<CalendarOutlined />}>
                Đặt lịch hẹn
              </Button>
            </Link>
          </Col>
          
          <Col xs={24} md={8} style={{ borderLeft: "1px solid #33312e", paddingLeft: 32 }}>
            <Space direction="vertical" size={4}>
              <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 500, letterSpacing: "0.05em" }}>
                HẠNG THÀNH VIÊN CỦA BẠN
              </span>
              <Typography.Title level={3} style={{ margin: 0, color: "#ffffff", fontFamily: "'Outfit', sans-serif" }}>
                {loyaltyTier}
              </Typography.Title>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <TrophyOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
                <Typography.Text style={{ color: "#ffffff", fontWeight: 600, fontSize: 16 }}>
                  {currentPoints} Điểm
                </Typography.Text>
              </div>
              <Progress percent={tierProgress} size="small" strokeColor="#bca374" trailColor="#33312e" style={{ marginTop: 8 }} />
              {pointsAway > 0 ? (
                <Typography.Text style={{ color: "#a3a19c", fontSize: 11 }}>
                  Còn {pointsAway} điểm để lên hạng tiếp theo
                </Typography.Text>
              ) : (
                <Typography.Text style={{ color: "#a3a19c", fontSize: 11 }}>
                  Đã đạt hạng VIP tối đa
                </Typography.Text>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Grid */}
      <Row gutter={[32, 32]}>
        {/* Next Appointment Card */}
        <Col xs={24} lg={15}>
          <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginBottom: 16 }}>
            Lịch hẹn sắp tới của bạn
          </Typography.Title>
          {nextAppointment ? (
            <Card bordered={false} hoverable={false} style={{ borderRadius: 16, border: "1px solid var(--app-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <Space direction="vertical" size={8}>
                  <span style={{ 
                    background: "var(--color-accent)", 
                    color: "var(--color-primary-dark)", 
                    padding: "4px 12px", 
                    borderRadius: 20, 
                    fontSize: 11, 
                    fontWeight: 600 
                  }}>
                    LỊCH HẸN {mapStatusToVietnamese(nextAppointment.status)} #{nextAppointment.id}
                  </span>
                  
                  <Typography.Title level={4} style={{ margin: "8px 0 4px", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                    {nextAppointment.service_details?.name || "Phục hồi tóc tổng quát"}
                  </Typography.Title>
                  
                  <Typography.Text style={{ color: "var(--color-muted)", fontSize: 14 }}>
                    Nhân viên phụ trách: <strong style={{ color: "var(--color-text)" }}>{nextAppointment.employee_details?.full_name || "Stylist được phân công"}</strong>
                  </Typography.Text>
                </Space>

                <div style={{ 
                  background: "var(--color-bg)", 
                  padding: "16px 24px", 
                  borderRadius: 12, 
                  textAlign: "center",
                  border: "1px solid var(--app-border)"
                }}>
                  <Typography.Text style={{ color: "var(--color-primary-dark)", fontWeight: 600, display: "block" }}>
                    {nextAppointment.scheduled_start ? formatAppointmentDate(nextAppointment.scheduled_start) : "Chưa xác định"}
                  </Typography.Text>
                  <Typography.Title level={3} style={{ margin: "4px 0 0", fontFamily: "'Outfit', sans-serif" }}>
                    {nextAppointment.scheduled_start ? formatShortTime(nextAppointment.scheduled_start) : "TBD"}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Thời lượng: {nextAppointment.service_details?.duration || 60} phút
                  </Typography.Text>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, borderTop: "1px solid var(--app-border)", paddingTop: 16 }}>
                <Link to={`/customer/appointments`}>
                  <Button type="default" style={{ borderRadius: 8 }}>
                    Đổi lịch hoặc hủy
                  </Button>
                </Link>
                <Link to={`/customer/appointments`}>
                  <Button type="primary" className="login-button-gold" style={{ borderRadius: 8 }}>
                    Xem chi tiết lịch hẹn
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card bordered={false} style={{ textAlign: "center", padding: "40px 0", borderRadius: 16, border: "1px solid var(--app-border)" }}>
              <CalendarOutlined style={{ fontSize: 40, color: "var(--color-muted)", marginBottom: 16 }} />
              <Typography.Paragraph type="secondary">
                Bạn chưa có lịch hẹn nào. Sẵn sàng cho buổi chăm sóc bản thân chứ?
              </Typography.Paragraph>
              <Link to="/customer/book">
                <Button type="primary" className="login-button-gold">Đặt lịch ngay</Button>
              </Link>
            </Card>
          )}
        </Col>

        {/* Vouchers & Promos */}
        <Col xs={24} lg={9}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              Ví mã giảm giá của bạn
            </Typography.Title>
            <Link to="/customer/vouchers" style={{ color: "var(--color-primary)", fontWeight: 500, fontSize: 13 }}>
              Xem tất cả <RightOutlined style={{ fontSize: 10 }} />
            </Link>
          </div>

          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {activeVouchers.length > 0 ? (
              activeVouchers.slice(0, 3).map((v) => (
                <Card 
                  key={v.id} 
                  bordered={false} 
                  style={{ 
                    background: "var(--color-surface)", 
                    border: "1px dashed var(--color-primary)",
                    borderRadius: 12
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Typography.Title level={4} style={{ margin: 0, color: "var(--color-primary-dark)", fontFamily: "'Outfit', sans-serif" }}>
                        {formatDiscountLabel(v.discount_type, v.discount_value)}
                      </Typography.Title>
                      <Typography.Text style={{ fontWeight: 500, display: "block", fontSize: 13, marginTop: 4 }}>
                        {formatMinInvoice(v.min_invoice)}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {formatExpirationDate(v.expires_at)}
                      </Typography.Text>
                    </div>

                    <div style={{ 
                      background: "var(--color-accent)", 
                      padding: "6px 12px", 
                      borderRadius: 6, 
                      fontFamily: "monospace", 
                      fontWeight: 700, 
                      color: "var(--color-primary-dark)",
                      fontSize: 13,
                      border: "1px solid var(--app-border)"
                    }}>
                      {v.code}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card bordered={false} style={{ textAlign: "center", padding: "20px 0", borderRadius: 12, border: "1px dashed var(--color-primary)" }}>
                <GiftOutlined style={{ fontSize: 24, color: "var(--color-muted)", marginBottom: 8 }} />
                <Typography.Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                  Bạn chưa có mã giảm giá nào.
                </Typography.Text>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      {/* Recommended Services Section */}
      <div style={{ marginTop: 40 }}>
        <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginBottom: 20 }}>
          Dịch vụ gợi ý cho bạn
        </Typography.Title>
        <Row gutter={[24, 24]}>
          {servicesList.map((service) => (
            <Col xs={24} md={8} key={service.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={service.name}
                    src={getServiceImage(service.name)}
                    style={{ height: 180, objectFit: "cover", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                  />
                }
                bodyStyle={{ padding: 20 }}
                style={{ borderRadius: 16 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "2px 8px", borderRadius: 12, fontWeight: 600, textTransform: "uppercase" }}>
                    {service.category || "Chăm sóc tóc"}
                  </span>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {service.duration_minutes} phút
                  </Typography.Text>
                </div>
                <Typography.Title level={5} style={{ margin: "4px 0 8px", fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
                  {service.name}
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ fontSize: 13, height: 40, overflow: "hidden", marginBottom: 16 }}>
                  {service.description || "Hãy trải nghiệm dịch vụ chăm sóc tóc cao cấp được thiết kế riêng cho phong cách của bạn."}
                </Typography.Paragraph>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--app-border)", paddingTop: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-primary-dark)" }}>
                    {Number(service.base_price).toLocaleString("vi-VN")} VNĐ
                  </span>
                  <Link to="/customer/book">
                    <Button type="primary" size="small" className="login-button-gold" style={{ borderRadius: 6 }}>
                      Đặt ngay
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};
