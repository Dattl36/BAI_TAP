import {
  CalendarOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  NotificationOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

export const StaffNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/staff", icon: <HomeOutlined />, label: "Bàn làm việc" },
    { key: "/staff/schedule", icon: <CalendarOutlined />, label: "Lịch của tôi" },
    { key: "/staff/appointments", icon: <ScheduleOutlined />, label: "Đặt chỗ được giao" },
    { key: "/staff/availability", icon: <CalendarOutlined />, label: "Lịch trống & Ca làm" },
    { key: "/staff/notifications", icon: <NotificationOutlined />, label: "Thông báo" },
    { key: "/staff/profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
  ];

  const selectedKey = menuItems.find((item) => 
    item.key === "/staff" 
      ? location.pathname === item.key 
      : location.pathname.startsWith(item.key)
  )?.key ?? "/staff";

  return (
    <Menu
      theme="light"
      mode="inline"
      items={menuItems}
      selectedKeys={[selectedKey]}
      onClick={({ key }) => navigate(key)}
      className="staff-sidebar-menu"
      style={{
        padding: "16px 0",
      }}
    />
  );
};

