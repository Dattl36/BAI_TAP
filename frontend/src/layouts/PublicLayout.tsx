import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Layout, Menu, Button, Space, Typography } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useMe } from "../hooks/useMe";

export const PublicLayout = () => {
  const { logout, isAuthenticated } = useAuth();
  const { data: user } = useMe();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const menuItems = [
    { key: "/", label: <Link to="/">Trang chủ</Link> },
    { key: "/services", label: <Link to="/services">Dịch vụ</Link> },
    { key: "/promotions", label: <Link to="/promotions">Khuyến mãi</Link> },
    { key: "/stylists", label: <Link to="/stylists">Chuyên viên</Link> },
    { key: "/about", label: <Link to="/about">Về chúng tôi</Link> },
    { key: "/contact", label: <Link to="/contact">Liên hệ</Link> },
  ];

  return (
    <Layout className="app-shell" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        className="app-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--app-border)",
          padding: "0 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "var(--app-header-height)",
        }}
      >
        <div
          style={{
            fontFamily: "'Outfit', serif",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.15em",
            color: "var(--color-primary)",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          S A L O N
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          disabledOverflow
          style={{
            flex: 1,
            justifyContent: "center",
            borderBottom: "none",
            background: "transparent",
            fontSize: 14,
            fontWeight: 500,
          }}
        />

        <Space size={16}>
          {isAuthenticated ? (
            <>
              <Space
                onClick={() => navigate("/dashboard")}
                style={{
                  cursor: "pointer",
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: "var(--color-bg)",
                  border: "1px solid var(--app-border)",
                  transition: "all 0.3s ease",
                }}
                className="header-user-profile"
              >
                <UserOutlined style={{ color: "var(--color-primary)" }} />
                <Typography.Text style={{ fontWeight: 500, fontSize: 13 }}>
                  Xin chào, {user?.first_name || user?.username || "Khách"}
                </Typography.Text>
              </Space>

              <Button
                type="primary"
                onClick={() => navigate("/dashboard")}
                className="login-button-gold"
                style={{ height: 36, padding: "0 16px", display: "flex", alignItems: "center", fontSize: 13 }}
              >
                Vào trang cá nhân
              </Button>

              <Button
                type="text"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button
                type="text"
                onClick={() => navigate("/login")}
                style={{ fontWeight: 500, color: "var(--color-text)", fontSize: 13 }}
              >
                Đăng nhập
              </Button>
              <Button
                type="default"
                onClick={() => navigate("/register")}
                style={{
                  fontWeight: 500,
                  fontSize: 13,
                  borderColor: "var(--color-primary)",
                  color: "var(--color-primary-dark)",
                  borderRadius: 8,
                }}
              >
                Đăng ký
              </Button>
              <Button
                type="primary"
                onClick={() => navigate("/booking-preview")}
                className="login-button-gold"
                style={{ height: 38, padding: "0 16px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}
              >
                Đặt lịch ngay
              </Button>
            </>
          )}
        </Space>
      </header>

      {/* Content */}
      <Layout.Content style={{ minHeight: "calc(100vh - 350px)", display: "flex", flexDirection: "column" }}>
        <Outlet />
      </Layout.Content>

      {/* Footer */}
      <footer
        style={{
          background: "#141412",
          color: "#a3a19c",
          padding: "50px 40px 30px",
          borderTop: "1px solid #232220",
          fontFamily: "'Outfit', sans-serif",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 40,
            marginBottom: 40,
          }}
        >
          <div>
            <Typography.Title level={4} style={{ color: "#ffffff", fontFamily: "'Playfair Display', serif", margin: "0 0 16px" }}>
              S A L O N
            </Typography.Title>
            <p style={{ fontSize: 13, lineHeight: "1.8", margin: 0 }}>
              Nơi trải nghiệm làm đẹp cao cấp và chuyên nghiệp. Chúng tôi mang đến dịch vụ tốt nhất để tôn vinh nét đẹp tự nhiên của bạn.
            </p>
          </div>
          <div>
            <Typography.Title level={5} style={{ color: "#ffffff", fontWeight: 600, fontSize: 14, margin: "0 0 16px" }}>
              GIỜ MỞ CỬA
            </Typography.Title>
            <p style={{ fontSize: 13, lineHeight: "1.8", margin: "0 0 8px" }}>Thứ Hai - Chủ Nhật: 09:00 - 20:00</p>
            <p style={{ fontSize: 13, lineHeight: "1.8", margin: 0 }}>* Vui lòng đặt lịch trước để được hỗ trợ chu đáo nhất.</p>
          </div>
          <div>
            <Typography.Title level={5} style={{ color: "#ffffff", fontWeight: 600, fontSize: 14, margin: "0 0 16px" }}>
              LIÊN HỆ
            </Typography.Title>
            <p style={{ fontSize: 13, lineHeight: "1.8", margin: "0 0 8px" }}>Địa chỉ: 123 Đường Sắc Đẹp, Quận 1, TP. HCM</p>
            <p style={{ fontSize: 13, lineHeight: "1.8", margin: "0 0 8px" }}>Điện thoại: (028) 3822 1234</p>
            <p style={{ fontSize: 13, lineHeight: "1.8", margin: 0 }}>Email: contact@salonbeauty.com</p>
          </div>
          <div>
            <Typography.Title level={5} style={{ color: "#ffffff", fontWeight: 600, fontSize: 14, margin: "0 0 16px" }}>
              KẾT NỐI
            </Typography.Title>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="#" style={{ color: "var(--color-primary)", fontSize: 13, transition: "color 0.3s" }}>Facebook</a>
              <a href="#" style={{ color: "var(--color-primary)", fontSize: 13, transition: "color 0.3s" }}>Instagram</a>
              <a href="#" style={{ color: "var(--color-primary)", fontSize: 13, transition: "color 0.3s" }}>Youtube</a>
            </div>
          </div>
        </div>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            paddingTop: 20,
            borderTop: "1px solid #232220",
            textAlign: "center",
            fontSize: 12,
          }}
        >
          &copy; {new Date().getFullYear()} S A L O N. All rights reserved.
        </div>
      </footer>
    </Layout>
  );
};
