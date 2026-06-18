import { Card, Col, Row, Typography, Button } from "antd";
import { Link } from "react-router-dom";
import { AreaChartOutlined, CalendarOutlined, ScissorOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { PageHeader } from "../../components/common/PageHeader";

export const ManagerReportsPage = () => {
  const folders = [
    { title: "Kiểm toán dòng doanh thu", desc: "Theo dõi hóa đơn, ưu đãi voucher và các khoản khấu trừ điểm thân thiết theo thời gian.", icon: <AreaChartOutlined />, path: "/manager/reports/revenue" },
    { title: "Phân bổ lịch đặt", desc: "Theo dõi lịch yêu cầu, lịch đã xác nhận, lượt nhận khách và xu hướng hủy lịch.", icon: <CalendarOutlined />, path: "/manager/reports/appointments" },
    { title: "Xếp hạng liệu trình và danh mục", desc: "Xác định liệu trình cắt tóc, spa và nhóm tạo kiểu mang lại doanh thu cao nhất.", icon: <ScissorOutlined />, path: "/manager/reports/services" },
    { title: "Chỉ số phát triển khách hàng", desc: "Theo dõi đăng ký khách VIP, lịch sử điểm thân thiết và tăng trưởng tài khoản.", icon: <TeamOutlined />, path: "/manager/reports/customers" },
    { title: "Sổ hoa hồng nhà tạo mẫu", desc: "Theo dõi buổi phục vụ, điểm đánh giá và năng suất của nhà tạo mẫu.", icon: <UserOutlined />, path: "/manager/reports/staff-performance" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <PageHeader 
        title="Bộ báo cáo điều hành" 
        description="Theo dõi chỉ số kinh doanh chi tiết, dòng doanh thu hằng tuần và tổng hợp hoa hồng." 
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
                      Mở sổ báo cáo
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
