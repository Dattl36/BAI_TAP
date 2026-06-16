import {
  AppstoreOutlined,
  BellOutlined,
  CalendarOutlined,
  CommentOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  GiftOutlined,
  LineChartOutlined,
  ScissorOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Layout, Menu, type MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import { ROUTES } from "../constants/routes";

type MenuItem = Required<MenuProps>["items"][number];

const menuItems: MenuItem[] = [
  { key: ROUTES.dashboard, icon: <DashboardOutlined />, label: "Bảng điều khiển" },
  { key: ROUTES.accounts, icon: <UserOutlined />, label: "Tài khoản" },
  { key: ROUTES.customers, icon: <TeamOutlined />, label: "Khách hàng" },
  { key: ROUTES.employees, icon: <ShopOutlined />, label: "Nhân viên" },
  { key: ROUTES.services, icon: <ScissorOutlined />, label: "Dịch vụ" },
  { key: ROUTES.appointments, icon: <CalendarOutlined />, label: "Lịch hẹn" },
  { key: ROUTES.serviceExecutions, icon: <AppstoreOutlined />, label: "Thực hiện dịch vụ" },
  { key: ROUTES.invoices, icon: <FileTextOutlined />, label: "Hóa đơn" },
  { key: ROUTES.payments, icon: <CreditCardOutlined />, label: "Thanh toán" },
  { key: ROUTES.promotions, icon: <GiftOutlined />, label: "Khuyến mãi" },
  { key: ROUTES.vouchers, icon: <DollarOutlined />, label: "Mã giảm giá" },
  { key: ROUTES.rewards, icon: <WalletOutlined />, label: "Điểm thưởng" },
  { key: ROUTES.feedback, icon: <CommentOutlined />, label: "Phản hồi" },
  { key: ROUTES.complaints, icon: <CommentOutlined />, label: "Khiếu nại" },
  { key: ROUTES.notifications, icon: <BellOutlined />, label: "Thông báo" },
  { key: ROUTES.reports, icon: <LineChartOutlined />, label: "Báo cáo" },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selected = menuItems.find((item) => item && "key" in item && location.pathname.startsWith(String(item.key)));

  return (
    <Layout.Sider width={260} className="app-sidebar">
      <div className="app-logo">S A L O N</div>
      <Menu
        theme="dark"
        mode="inline"
        items={menuItems}
        selectedKeys={selected && "key" in selected ? [String(selected.key)] : [ROUTES.dashboard]}
        onClick={({ key }) => navigate(key)}
      />
    </Layout.Sider>
  );
};
