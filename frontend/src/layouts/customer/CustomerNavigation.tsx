import {
  CalendarOutlined,
  CommentOutlined,
  DollarOutlined,
  GiftOutlined,
  HomeOutlined,
  NotificationOutlined,
  ProfileOutlined,
  StarOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

export const CustomerNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/customer", icon: <HomeOutlined />, label: "Home" },
    { key: "/customer/book", icon: <CalendarOutlined />, label: "Book Now" },
    { key: "/customer/appointments", icon: <ProfileOutlined />, label: "Appointments" },
    { key: "/customer/invoices", icon: <DollarOutlined />, label: "Invoices" },
    { key: "/customer/rewards", icon: <WalletOutlined />, label: "Rewards" },
    { key: "/customer/vouchers", icon: <GiftOutlined />, label: "Vouchers" },
    { key: "/customer/feedback", icon: <StarOutlined />, label: "Feedback" },
    { key: "/customer/complaints", icon: <CommentOutlined />, label: "Complaints" },
    { key: "/customer/notifications", icon: <NotificationOutlined />, label: "Notifications" },
  ];

  const selectedKey = menuItems.find((item) => 
    item.key === "/customer" 
      ? location.pathname === item.key 
      : location.pathname.startsWith(item.key)
  )?.key ?? "/customer";

  return (
    <Menu
      mode="horizontal"
      items={menuItems}
      selectedKeys={[selectedKey]}
      onClick={({ key }) => navigate(key)}
      style={{
        background: "transparent",
        borderBottom: "none",
        flex: 1,
        justifyContent: "center",
        lineHeight: "64px",
      }}
    />
  );
};
