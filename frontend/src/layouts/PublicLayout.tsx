import { LogoutOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Drawer, Layout, Menu, Space, Typography } from "antd";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useMe } from "../hooks/useMe";
import { useResponsive } from "../hooks/useResponsive";

export const PublicLayout = () => {
  const { logout, isAuthenticated } = useAuth();
  const { data: user } = useMe();
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    setMenuOpen(false);
  };

  const menuItems = [
    { key: "/", label: <Link to="/">Trang chủ</Link> },
    { key: "/services", label: <Link to="/services">Dịch vụ</Link> },
    { key: "/promotions", label: <Link to="/promotions">Khuyến mãi</Link> },
    { key: "/stylists", label: <Link to="/stylists">Chuyên viên</Link> },
    { key: "/about", label: <Link to="/about">Về chúng tôi</Link> },
    { key: "/contact", label: <Link to="/contact">Liên hệ</Link> },
  ];

  const authActions = (
    <Space className="public-header-actions" size={12} wrap>
      {isAuthenticated ? (
        <>
          <Button type="default" icon={<UserOutlined />} onClick={() => navigate("/dashboard")}>
            Trang cá nhân
          </Button>
          <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </>
      ) : (
        <>
          <Button type="text" onClick={() => navigate("/login")}>
            Đăng nhập
          </Button>
          <Button type="default" onClick={() => navigate("/register")}>
            Đăng ký
          </Button>
          <Button type="primary" onClick={() => navigate("/booking-preview")} className="login-button-gold">
            Đặt lịch ngay
          </Button>
        </>
      )}
    </Space>
  );

  return (
    <Layout className="app-shell public-layout" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <header className="public-header">
        <button type="button" className="public-logo" onClick={() => navigate("/")}>
          S A L O N
        </button>

        {isMobile ? (
          <>
            <Button type="text" icon={<MenuOutlined />} className="public-menu-button" onClick={() => setMenuOpen(true)} aria-label="Mo menu" />
            <Drawer
              placement="right"
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              width="86%"
              className="public-mobile-drawer"
              title="S A L O N"
            >
              <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={() => setMenuOpen(false)}
                style={{ borderInlineEnd: "none" }}
              />
              <div className="public-mobile-actions">{authActions}</div>
            </Drawer>
          </>
        ) : (
          <>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              disabledOverflow
              className="public-desktop-menu"
            />
            {authActions}
          </>
        )}
      </header>

      <Layout.Content className="public-content">
        <Outlet />
      </Layout.Content>

      <footer className="public-footer">
        <div className="public-footer__grid">
          <div>
            <Typography.Title level={4} style={{ color: "#ffffff", fontFamily: "'Playfair Display', serif", margin: "0 0 16px" }}>
              S A L O N
            </Typography.Title>
            <p>Nơi trải nghiệm làm đẹp cao cấp và chuyên nghiệp. Chúng tôi mang đến dịch vụ tốt nhất để tôn vinh nét đẹp tự nhiên của bạn.</p>
          </div>
          <div>
            <Typography.Title level={5} className="public-footer__title">GIỜ MỞ CỬA</Typography.Title>
            <p>Thứ Hai - Chủ Nhật: 09:00 - 20:00</p>
            <p>* Vui lòng đặt lịch trước để được hỗ trợ chu đáo nhất.</p>
          </div>
          <div>
            <Typography.Title level={5} className="public-footer__title">LIÊN HỆ</Typography.Title>
            <p>Địa chỉ: 123 Đường Sắc Đẹp, Quận 1, TP. HCM</p>
            <p>Điện thoại: (028) 3822 1234</p>
            <p>Email: contact@salonbeauty.com</p>
          </div>
          <div>
            <Typography.Title level={5} className="public-footer__title">KẾT NỐI</Typography.Title>
            <div className="public-footer__links">
              <a href="#">Facebook</a>
              <a href="#">Instagram</a>
              <a href="#">Youtube</a>
            </div>
          </div>
        </div>
        <div className="public-footer__copyright">&copy; {new Date().getFullYear()} S A L O N. All rights reserved.</div>
      </footer>
    </Layout>
  );
};
