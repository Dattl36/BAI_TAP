import { LogoutOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useMe } from "../../hooks/useMe";

export const ManagerHeader = () => {
  const { logout } = useAuth();
  const { data: user } = useMe();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/manager") return "Business Command Center";
    if (path.startsWith("/manager/reports/revenue")) return "Revenue Streams Audit";
    if (path.startsWith("/manager/reports/appointments")) return "Bookings Distribution";
    if (path.startsWith("/manager/reports/services")) return "Catalog Performance Chart";
    if (path.startsWith("/manager/reports/customers")) return "Client Acquisition Metrics";
    if (path.startsWith("/manager/reports/staff-performance")) return "Stylist Commission Ledger";
    if (path.startsWith("/manager/reports")) return "Executive Reports Folder";
    if (path.startsWith("/manager/accounts")) return "Access Level Control";
    if (path.startsWith("/manager/employees")) return "Stylist Roster & Hires";
    if (path.startsWith("/manager/services")) return "Menu Offerings Catalog";
    if (path.startsWith("/manager/promotions")) return "Marketing Campaign Console";
    if (path.startsWith("/manager/vouchers")) return "Loyalty Discount Vouchers";
    if (path.startsWith("/manager/customers")) return "Client Registry Database";
    if (path.startsWith("/manager/notifications")) return "System Alarms Registry";
    return "Salon Command Console";
  };

  return (
    <header className="app-header" style={{ padding: "0 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SettingOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
        <Typography.Title level={4} style={{ margin: 0, fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>
          {getPageTitle()}
        </Typography.Title>
      </div>

      <Space size={16}>
        <div className="header-user-profile" style={{ background: "var(--color-bg)", border: "1px solid var(--app-border)" }}>
          <UserOutlined style={{ color: "var(--color-primary)" }} />
          <Typography.Text style={{ fontWeight: 500, fontSize: 13 }}>
            Admin: {user?.first_name || user?.username || "Manager"}
          </Typography.Text>
        </div>

        <Button 
          type="text" 
          danger 
          icon={<LogoutOutlined />} 
          onClick={logout}
          style={{ fontSize: 13, fontWeight: 500 }}
        >
          Logout
        </Button>
      </Space>
    </header>
  );
};
