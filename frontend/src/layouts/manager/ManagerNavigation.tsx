import {
  AreaChartOutlined,
  BellOutlined,
  GiftOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

export const ManagerNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/manager", icon: <HomeOutlined />, label: "Dashboard" },
    { key: "/manager/reports", icon: <AreaChartOutlined />, label: "Revenue Reports" },
    { key: "/manager/invoices", icon: <FileTextOutlined />, label: "Invoices & Payments" },
    { key: "/manager/scheduling", icon: <ScheduleOutlined />, label: "Staff Scheduling" },
    { key: "/manager/appointments", icon: <CalendarOutlined />, label: "Salon Appointments" },
    { key: "/manager/vouchers", icon: <GiftOutlined />, label: "Voucher & Promotions" },
    { key: "/manager/customers", icon: <TeamOutlined />, label: "Customers" },
    { key: "/manager/notifications", icon: <BellOutlined />, label: "Notifications" },
    { key: "/manager/accounts", icon: <UserOutlined />, label: "User Access Control" },
    { key: "/manager/settings", icon: <SettingOutlined />, label: "Settings" },
  ];

  const selectedKey = menuItems.find((item) => 
    item.key === "/manager" 
      ? location.pathname === item.key 
      : location.pathname.startsWith(item.key)
  )?.key ?? "/manager";

  return (
    <Menu
      theme="dark"
      mode="inline"
      items={menuItems}
      selectedKeys={[selectedKey]}
      onClick={({ key }) => navigate(key)}
      style={{
        background: "transparent",
        borderInlineEnd: "none",
        padding: "16px 12px",
      }}
    />
  );
};
