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
    if (path === "/manager") return "Trung tâm quản trị kinh doanh";
    if (path.startsWith("/manager/reports/revenue")) return "Báo cáo doanh thu chi tiết";
    if (path.startsWith("/manager/reports/appointments")) return "Thống kê phân bổ lịch hẹn";
    if (path.startsWith("/manager/reports/services")) return "Hiệu suất danh mục dịch vụ";
    if (path.startsWith("/manager/reports/customers")) return "Chỉ số thu hút khách hàng";
    if (path.startsWith("/manager/reports/staff-performance")) return "Hiệu suất & Hoa hồng thợ";
    if (path.startsWith("/manager/reports")) return "Báo cáo tổng hợp quản trị";
    if (path.startsWith("/manager/accounts")) return "Phân quyền truy cập tài khoản";
    if (path.startsWith("/manager/employees")) return "Danh sách & Tuyển dụng nhân viên";
    if (path.startsWith("/manager/services")) return "Quản lý danh mục dịch vụ";
    if (path.startsWith("/manager/promotions")) return "Chiến dịch khuyến mãi tiếp thị";
    if (path.startsWith("/manager/vouchers")) return "Quản lý mã giảm giá tri ân";
    if (path.startsWith("/manager/customers")) return "Cơ sở dữ liệu khách hàng";
    if (path.startsWith("/manager/notifications")) return "Nhật ký cảnh báo hệ thống";
    return "Bảng quản trị Salon";
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
            Quản trị viên: {user?.first_name || user?.username || "Manager"}
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
