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
    if (path.startsWith(ROUTES.dashboard)) return "Bảng điều khiển";
    if (path.startsWith(ROUTES.accounts)) return "Quản lý tài khoản";
    if (path.startsWith(ROUTES.customers)) return "Không gian khách hàng";
    if (path.startsWith(ROUTES.employees)) return "Danh bạ nhân viên";
    if (path.startsWith(ROUTES.services)) return "Danh mục dịch vụ";
    if (path.startsWith(ROUTES.appointments)) return "Lịch hẹn & Đặt chỗ";
    if (path.startsWith(ROUTES.serviceExecutions)) return "Thực hiện dịch vụ";
    if (path.startsWith(ROUTES.invoices)) return "Hóa đơn & Thanh toán";
    if (path.startsWith(ROUTES.payments)) return "Giao dịch & Thanh toán";
    if (path.startsWith(ROUTES.promotions)) return "Khuyến mãi tiếp thị";
    if (path.startsWith(ROUTES.vouchers)) return "Mã giảm giá";
    if (path.startsWith(ROUTES.rewards)) return "Điểm thưởng khách hàng";
    if (path.startsWith(ROUTES.feedback)) return "Phản hồi khách hàng";
    if (path.startsWith(ROUTES.complaints)) return "Sổ khiếu nại";
    if (path.startsWith(ROUTES.notifications)) return "Thông báo hoạt động";
    if (path.startsWith(ROUTES.reports)) return "Phân tích & Báo cáo";
    return "Quản lý Salon";
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
            {user?.username ?? "Quản trị viên"}
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
