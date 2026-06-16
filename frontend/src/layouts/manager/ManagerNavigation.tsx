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
    { key: "/manager", icon: <HomeOutlined />, label: "Bảng điều khiển" },
    { key: "/manager/reports", icon: <AreaChartOutlined />, label: "Báo cáo doanh thu" },
    { key: "/manager/invoices", icon: <FileTextOutlined />, label: "Hóa đơn & Thanh toán" },
    { key: "/manager/scheduling", icon: <ScheduleOutlined />, label: "Lịch làm việc của thợ" },
    { key: "/manager/appointments", icon: <CalendarOutlined />, label: "Lịch hẹn của Salon" },
    { key: "/manager/vouchers", icon: <GiftOutlined />, label: "Mã giảm giá & Khuyến mãi" },
    { key: "/manager/customers", icon: <TeamOutlined />, label: "Khách hàng" },
    { key: "/manager/notifications", icon: <BellOutlined />, label: "Thông báo" },
    { key: "/manager/accounts", icon: <UserOutlined />, label: "Kiểm soát truy cập" },
    { key: "/manager/settings", icon: <SettingOutlined />, label: "Cài đặt" },
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
