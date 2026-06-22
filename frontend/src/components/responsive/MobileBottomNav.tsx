import { CalendarOutlined, HomeOutlined, ProfileOutlined, UserOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const items = [
  { key: "/customer", label: "Trang chủ", icon: <HomeOutlined /> },
  { key: "/customer/book", label: "Đặt lịch", icon: <CalendarOutlined /> },
  { key: "/customer/appointments", label: "Lịch hẹn", icon: <ProfileOutlined /> },
  { key: "/customer/profile", label: "Tài khoản", icon: <UserOutlined /> },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="mobile-bottom-nav" aria-label="Dieu huong khach hang">
      {items.map((item) => {
        const active = item.key === "/customer" ? location.pathname === item.key : location.pathname.startsWith(item.key);
        return (
          <button
            key={item.key}
            type="button"
            className={active ? "mobile-bottom-nav__item mobile-bottom-nav__item--active" : "mobile-bottom-nav__item"}
            onClick={() => navigate(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
