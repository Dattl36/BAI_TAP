import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Row, Spin, Typography, Input, Tabs, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined, ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";

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

export const PublicServiceListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["public", "services"],
    queryFn: () => publicApi.getServices(),
  });

  const services = getListItems(servicesData);

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(services.map((s) => s.category || "Khác").filter(Boolean)))];

  // Filter services
  const filteredServices = services.filter((s) => {
    const nameMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (s.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = activeTab === "all" || (s.category || "Khác") === activeTab;
    return nameMatch && categoryMatch;
  });

  const handleBookService = (serviceId: string | number) => {
    // Navigate to booking-preview page, optionally store in sessionStorage first
    sessionStorage.setItem("preview_selected_service", String(serviceId));
    navigate("/booking-preview");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", animation: "fadeIn 0.5s ease", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Typography.Title level={1} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: 0 }}>
          Bảng Giá Dịch Vụ
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8, fontSize: 15 }}>
          Khám phá danh sách các dịch vụ chăm sóc tóc và làm đẹp chuyên nghiệp tại Salon.
        </Typography.Paragraph>
      </div>

      {/* Filter and Search controls */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          gap: 20, 
          marginBottom: 32,
          flexWrap: "wrap"
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ flex: 1, minWidth: 280 }}
          items={categories.map((cat) => ({
            key: cat,
            label: cat === "all" ? "Tất Cả" : cat,
          }))}
        />

        <Input
          prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
          placeholder="Tìm kiếm dịch vụ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", maxWidth: 320, height: 40, borderRadius: 8 }}
          allowClear
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}><Spin size="large" /></div>
      ) : filteredServices.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px 0", borderRadius: 16 }}>
          <Typography.Text type="secondary" style={{ fontSize: 16 }}>
            Không tìm thấy dịch vụ nào phù hợp với yêu cầu của bạn.
          </Typography.Text>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredServices.map((service) => (
            <Col xs={24} sm={12} md={8} key={service.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={service.name}
                    src={getServiceImage(service.name)}
                    style={{ height: 180, objectFit: "cover" }}
                  />
                }
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "2px 6px", borderRadius: 10, fontWeight: 600, textTransform: "uppercase" }}>
                    {service.category || "Tạo mẫu tóc"}
                  </span>
                  <Space style={{ fontSize: 12, color: "var(--color-muted)" }}>
                    <ClockCircleOutlined /> {service.duration_minutes} phút
                  </Space>
                </div>
                
                <Typography.Title level={4} style={{ margin: "4px 0 8px", fontWeight: 600, fontSize: 16 }}>
                  {service.name}
                </Typography.Title>
                
                <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", height: 36, overflow: "hidden", marginBottom: 16 }}>
                  {service.description || "Hãy trải nghiệm công thức chăm sóc tóc chất lượng cao giúp giữ nếp lâu dài."}
                </Typography.Text>

                <div 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    borderTop: "1px solid var(--app-border)", 
                    paddingTop: 12 
                  }}
                >
                  <strong style={{ color: "var(--color-primary-dark)", fontSize: 16 }}>
                    {Number(service.base_price).toLocaleString()} VND
                  </strong>
                  <Space size={8}>
                    <Button 
                      type="default" 
                      onClick={() => navigate(`/services/${service.id}`)}
                      style={{ height: 32, borderRadius: 6, fontSize: 12 }}
                    >
                      Chi tiết
                    </Button>
                    <Button 
                      type="primary" 
                      onClick={() => handleBookService(service.id)}
                      className="login-button-gold"
                      icon={<CalendarOutlined />}
                      style={{ height: 32, borderRadius: 6, fontSize: 12, display: "flex", alignItems: "center" }}
                    >
                      Đặt ngay
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
