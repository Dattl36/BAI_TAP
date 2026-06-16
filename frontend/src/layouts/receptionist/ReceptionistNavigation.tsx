import {
  CalendarOutlined,
  CommentOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  NotificationOutlined,
  PlusOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

export const ReceptionistNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    // Operations
    { key: "__ops_label", label: <span className="rcpt-nav-label">Operations</span>, disabled: true, style: { height: 28, cursor: "default" } },
    { key: "/receptionist", icon: <HomeOutlined />, label: "Desk Overview" },
    { key: "/receptionist/today", icon: <DashboardOutlined />, label: "Today's Queue" },
    { key: "/receptionist/calendar", icon: <CalendarOutlined />, label: "Appointments" },
    { key: "/receptionist/appointments/create", icon: <PlusOutlined />, label: "New Booking" },

    // Business
    { key: "__biz_label", label: <span className="rcpt-nav-label">Business</span>, disabled: true, style: { height: 28, cursor: "default", marginTop: 4 } },
    { key: "/receptionist/customers", icon: <TeamOutlined />, label: "Client Database" },
    { key: "/receptionist/invoices", icon: <FileTextOutlined />, label: "Invoices" },
    { key: "/receptionist/payments", icon: <CreditCardOutlined />, label: "Transactions" },

    // Support
    { key: "__support_label", label: <span className="rcpt-nav-label">Support</span>, disabled: true, style: { height: 28, cursor: "default", marginTop: 4 } },
    { key: "/receptionist/feedback", icon: <CommentOutlined />, label: "Feedback" },
    { key: "/receptionist/complaints", icon: <ExclamationCircleOutlined />, label: "Disputes" },
    { key: "/receptionist/notifications", icon: <NotificationOutlined />, label: "Alerts" },
  ];

  const navigableKeys = menuItems.filter((i) => !i.key.startsWith("__")).map((i) => i.key);
  const selectedKey = navigableKeys.find((key) =>
    key === "/receptionist"
      ? location.pathname === key
      : location.pathname.startsWith(key)
  ) ?? "/receptionist";

  return (
    <Menu
      theme="light"
      mode="inline"
      items={menuItems}
      selectedKeys={[selectedKey]}
      onClick={({ key }) => {
        if (!key.startsWith("__")) navigate(key);
      }}
      style={{ borderRight: "none" }}
    />
  );
};
