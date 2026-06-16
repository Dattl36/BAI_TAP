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
    { key: "__ops_label", label: <span className="rcpt-nav-label">Vận hành</span>, disabled: true, style: { height: 28, cursor: "default" } },
    { key: "/receptionist", icon: <HomeOutlined />, label: "Tổng quan quầy" },
    { key: "/receptionist/today", icon: <DashboardOutlined />, label: "Hàng đợi hôm nay" },
    { key: "/receptionist/calendar", icon: <CalendarOutlined />, label: "Lịch hẹn" },
    { key: "/receptionist/appointments/create", icon: <PlusOutlined />, label: "Đặt lịch mới" },

    // Business
    { key: "__biz_label", label: <span className="rcpt-nav-label">Kinh doanh</span>, disabled: true, style: { height: 28, cursor: "default", marginTop: 4 } },
    { key: "/receptionist/customers", icon: <TeamOutlined />, label: "Cơ sở dữ liệu khách" },
    { key: "/receptionist/invoices", icon: <FileTextOutlined />, label: "Hóa đơn" },
    { key: "/receptionist/payments", icon: <CreditCardOutlined />, label: "Giao dịch" },

    // Support
    { key: "__support_label", label: <span className="rcpt-nav-label">Hỗ trợ</span>, disabled: true, style: { height: 28, cursor: "default", marginTop: 4 } },
    { key: "/receptionist/feedback", icon: <CommentOutlined />, label: "Phản hồi" },
    { key: "/receptionist/complaints", icon: <ExclamationCircleOutlined />, label: "Tranh chấp / Khiếu nại" },
    { key: "/receptionist/notifications", icon: <NotificationOutlined />, label: "Cảnh báo & Thông báo" },
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
