import { BellOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Badge, Button, Space, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useMe } from "../hooks/useMe";
import { ROUTES } from "../constants/routes";

export const HeaderBar = () => {
  const { logout } = useAuth();
  const { data: user } = useMe();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith(ROUTES.dashboard)) return "Dashboard";
    if (path.startsWith(ROUTES.accounts)) return "Account Management";
    if (path.startsWith(ROUTES.customers)) return "Customers Workspace";
    if (path.startsWith(ROUTES.employees)) return "Staff Directory";
    if (path.startsWith(ROUTES.services)) return "Service Catalog";
    if (path.startsWith(ROUTES.appointments)) return "Bookings & Appointments";
    if (path.startsWith(ROUTES.serviceExecutions)) return "Service Executions";
    if (path.startsWith(ROUTES.invoices)) return "Billing & Invoices";
    if (path.startsWith(ROUTES.payments)) return "Payments & Transactions";
    if (path.startsWith(ROUTES.promotions)) return "Marketing Promotions";
    if (path.startsWith(ROUTES.vouchers)) return "Discount Vouchers";
    if (path.startsWith(ROUTES.rewards)) return "Customer Rewards";
    if (path.startsWith(ROUTES.feedback)) return "Client Feedback";
    if (path.startsWith(ROUTES.complaints)) return "Complaints Registry";
    if (path.startsWith(ROUTES.notifications)) return "Activity Notifications";
    if (path.startsWith(ROUTES.reports)) return "Analytics & Reports";
    return "Salon Management";
  };

  return (
    <header className="app-header">
      <div className="app-header-title">
        <Typography.Title level={4} style={{ margin: 0, fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>
          {getPageTitle()}
        </Typography.Title>
      </div>
      <Space size={20}>
        <Badge count={3} size="small" color="#bca374">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18, color: "var(--color-muted)" }} />}
            onClick={() => navigate(ROUTES.notifications)}
            style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: "50%" }}
          />
        </Badge>
        
        <div className="header-user-profile">
          <UserOutlined style={{ color: "var(--color-primary)", fontSize: 14 }} />
          <Typography.Text style={{ fontWeight: 500, fontSize: 13, color: "var(--color-text)" }}>
            {user?.username ?? "Salon Admin"}
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
