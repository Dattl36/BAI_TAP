import { Card, Col, Row, Typography, Button } from "antd";
import { Link } from "react-router-dom";
import { AreaChartOutlined, CalendarOutlined, ScissorOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { PageHeader } from "../../components/common/PageHeader";

export const ManagerReportsPage = () => {
  const folders = [
    { title: "Revenue Streams Audit", desc: "Track salon billing invoices, voucher discounts, and loyalty deductions over time.", icon: <AreaChartOutlined />, path: "/manager/reports/revenue" },
    { title: "Bookings Distribution", desc: "Monitor requested vs confirmed sessions, arrived check-ins, and cancellation trends.", icon: <CalendarOutlined />, path: "/manager/reports/appointments" },
    { title: "Treatments & Catalog Rank", desc: "Identify popular haircut treatments, spas, and styling categories generating top revenues.", icon: <ScissorOutlined />, path: "/manager/reports/services" },
    { title: "Client Acquisition Metrics", desc: "Auditing VIP customer registrations, loyalty point statement logs, and account growth.", icon: <TeamOutlined />, path: "/manager/reports/customers" },
    { title: "Stylist Commission Ledger", desc: "Stylist session attendance tracker, rating scores, and therapist productivity metrics.", icon: <UserOutlined />, path: "/manager/reports/staff-performance" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <PageHeader 
        title="Executive Reports & Folders" 
        description="Access granular business metrics, weekly revenue streams, and commissions summaries." 
      />

      <Row gutter={[24, 24]}>
        {folders.map((f) => (
          <Col xs={24} md={12} key={f.title}>
            <Card 
              bordered={false} 
              hoverable
              style={{ borderRadius: 16, height: "100%" }}
            >
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ 
                  background: "var(--color-accent)", 
                  color: "var(--color-primary-dark)", 
                  width: 52, 
                  height: 52, 
                  borderRadius: 12, 
                  display: "grid", 
                  placeItems: "center",
                  fontSize: 22
                }}>
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <Typography.Title level={4} style={{ margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>
                    {f.title}
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16, minHeight: 40 }}>
                    {f.desc}
                  </Typography.Paragraph>
                  <Link to={f.path}>
                    <Button type="primary" className="login-button-gold" style={{ borderRadius: 8 }}>
                      Access Ledger
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
