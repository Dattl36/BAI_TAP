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
    : (user?.username || "Value Client");

  const servicesList = normalizePaginatedResponse(servicesData || []).results.slice(0, 3);

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
              Welcome back, {welcomeName}
            </Typography.Title>
            <Typography.Paragraph style={{ marginTop: 8, color: "#a3a19c", fontSize: 14 }}>
              Your sanctuary of self-care and visual elevation is ready. Book your next visit or track your wellness benefits.
            </Typography.Paragraph>
            <Link to="/customer/book">
              <Button type="primary" size="large" className="login-button-gold" icon={<CalendarOutlined />}>
                Reserve Appointment
              </Button>
            </Link>
          </Col>
          
          <Col xs={24} md={8} style={{ borderLeft: "1px solid #33312e", paddingLeft: 32 }}>
            <Space direction="vertical" size={4}>
              <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 500, letterSpacing: "0.05em" }}>
                YOUR LOYALTY TIER
              </span>
              <Typography.Title level={3} style={{ margin: 0, color: "#ffffff", fontFamily: "'Outfit', sans-serif" }}>
                {loyaltyTier}
              </Typography.Title>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <TrophyOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
                <Typography.Text style={{ color: "#ffffff", fontWeight: 600, fontSize: 16 }}>
                  {currentPoints} Points
                </Typography.Text>
              </div>
              <Progress percent={tierProgress} size="small" strokeColor="#bca374" trailColor="#33312e" style={{ marginTop: 8 }} />
              {pointsAway > 0 ? (
                <Typography.Text style={{ color: "#a3a19c", fontSize: 11 }}>
                  {pointsAway} points away from next tier upgrade
                </Typography.Text>
              ) : (
                <Typography.Text style={{ color: "#a3a19c", fontSize: 11 }}>
                  Maximum VIP Tier Achieved
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
            Your Upcoming Sanctuary Session
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
                    {nextAppointment.status.toUpperCase()} BOOKING #{nextAppointment.id}
                  </span>
                  
                  <Typography.Title level={4} style={{ margin: "8px 0 4px", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                    {nextAppointment.service_details?.name || "General Hair Treatment"}
                  </Typography.Title>
                  
                  <Typography.Text style={{ color: "var(--color-muted)", fontSize: 14 }}>
                    With Specialist: <strong style={{ color: "var(--color-text)" }}>{nextAppointment.employee_details?.full_name || "Assigned Stylist"}</strong>
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
                    {nextAppointment.scheduled_start ? new Date(nextAppointment.scheduled_start).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "TBD"}
                  </Typography.Text>
                  <Typography.Title level={3} style={{ margin: "4px 0 0", fontFamily: "'Outfit', sans-serif" }}>
                    {nextAppointment.scheduled_start ? new Date(nextAppointment.scheduled_start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : "TBD"}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Duration: {nextAppointment.service_details?.duration || 60} Mins
                  </Typography.Text>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, borderTop: "1px solid var(--app-border)", paddingTop: 16 }}>
                <Link to={`/customer/appointments`}>
                  <Button type="default" style={{ borderRadius: 8 }}>
                    Reschedule or Cancel
                  </Button>
                </Link>
                <Link to={`/customer/appointments`}>
                  <Button type="primary" className="login-button-gold" style={{ borderRadius: 8 }}>
                    View Session Details
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card bordered={false} style={{ textAlign: "center", padding: "40px 0", borderRadius: 16, border: "1px solid var(--app-border)" }}>
              <CalendarOutlined style={{ fontSize: 40, color: "var(--color-muted)", marginBottom: 16 }} />
              <Typography.Paragraph type="secondary">
                No active bookings scheduled. Ready for your self-care session?
              </Typography.Paragraph>
              <Link to="/customer/book">
                <Button type="primary" className="login-button-gold">Book Session Now</Button>
              </Link>
            </Card>
          )}
        </Col>

        {/* Vouchers & Promos */}
        <Col xs={24} lg={9}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              Your Voucher Wallet
            </Typography.Title>
            <Link to="/customer/vouchers" style={{ color: "var(--color-primary)", fontWeight: 500, fontSize: 13 }}>
              View All <RightOutlined style={{ fontSize: 10 }} />
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
                        {v.discount_type === "percent" ? `${v.discount_value}% OFF` : `${Number(v.discount_value).toLocaleString()} VND OFF`}
                      </Typography.Title>
                      <Typography.Text style={{ fontWeight: 500, display: "block", fontSize: 13, marginTop: 4 }}>
                        Min invoice: {Number(v.min_invoice || 0).toLocaleString()} VND
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        Expires: {v.expires_at ? new Date(v.expires_at).toLocaleDateString() : "Never"}
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
                  Your voucher wallet is empty.
                </Typography.Text>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      {/* Recommended Services Section */}
      <div style={{ marginTop: 40 }}>
        <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginBottom: 20 }}>
          Recommended Services for You
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
                    {service.category || "Hair Care"}
                  </span>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {service.duration_minutes} mins
                  </Typography.Text>
                </div>
                <Typography.Title level={5} style={{ margin: "4px 0 8px", fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
                  {service.name}
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ fontSize: 13, height: 40, overflow: "hidden", marginBottom: 16 }}>
                  {service.description || "Indulge in our premium care formulated for your absolute wellness and style rejuvenation."}
                </Typography.Paragraph>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--app-border)", paddingTop: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-primary-dark)" }}>
                    {Number(service.base_price).toLocaleString()} VND
                  </span>
                  <Link to="/customer/book">
                    <Button type="primary" size="small" className="login-button-gold" style={{ borderRadius: 6 }}>
                      Book Now
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
