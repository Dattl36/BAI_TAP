import { LogoutOutlined, UserOutlined, ScissorOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useMe } from "../../hooks/useMe";

export const StaffHeader = () => {
  const { logout } = useAuth();
  const { data: user } = useMe();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/staff") return "Bàn làm việc của tôi";
    if (path.startsWith("/staff/schedule")) return "Lịch trình của tôi";
    if (path.startsWith("/staff/appointments")) return "Danh sách đặt chỗ được giao";
    if (path.startsWith("/staff/executions")) return "Tiến trình thực hiện dịch vụ";
    if (path.startsWith("/staff/availability")) return "Lịch trống & Ca làm việc";
    if (path.startsWith("/staff/notifications")) return "Thông báo & Nhắc nhở";
    if (path.startsWith("/staff/profile")) return "Hồ sơ stylist cá nhân";
    return "Không gian làm việc Stylist";
  };

  return (
    <header className="app-header" style={{ padding: "0 24px", background: "#ffffff", borderBottom: "1px solid var(--app-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ScissorOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
        <Typography.Title level={4} style={{ margin: 0, fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>
          {getPageTitle()}
        </Typography.Title>
      </div>

      <Space size={16}>
        <div className="header-user-profile" style={{ background: "var(--color-bg)", border: "1px solid var(--app-border)", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "var(--color-primary)" }} />
          <Typography.Text style={{ fontWeight: 500, fontSize: 13 }}>
            Stylist: {user?.full_name || user?.username || "Nhân viên"}
          </Typography.Text>
        </div>

        <Button 
          type="text" 
          danger 
          icon={<LogoutOutlined />} 
          onClick={logout}
          style={{ fontSize: 13, fontWeight: 500 }}
        >
          Đăng xuất
        </Button>
      </Space>
    </header>
  );
};

