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
  { key: ROUTES.dashboard, icon: <DashboardOutlined />, label: "Dashboard" },
  { key: ROUTES.accounts, icon: <UserOutlined />, label: "Accounts" },
  { key: ROUTES.customers, icon: <TeamOutlined />, label: "Customers" },
  { key: ROUTES.employees, icon: <ShopOutlined />, label: "Employees" },
  { key: ROUTES.services, icon: <ScissorOutlined />, label: "Services" },
  { key: ROUTES.appointments, icon: <CalendarOutlined />, label: "Appointments" },
  { key: ROUTES.serviceExecutions, icon: <AppstoreOutlined />, label: "Service Executions" },
  { key: ROUTES.invoices, icon: <FileTextOutlined />, label: "Invoices" },
  { key: ROUTES.payments, icon: <CreditCardOutlined />, label: "Payments" },
  { key: ROUTES.promotions, icon: <GiftOutlined />, label: "Promotions" },
  { key: ROUTES.vouchers, icon: <DollarOutlined />, label: "Vouchers" },
  { key: ROUTES.rewards, icon: <WalletOutlined />, label: "Rewards" },
  { key: ROUTES.feedback, icon: <CommentOutlined />, label: "Feedback" },
  { key: ROUTES.complaints, icon: <CommentOutlined />, label: "Complaints" },
  { key: ROUTES.notifications, icon: <BellOutlined />, label: "Notifications" },
  { key: ROUTES.reports, icon: <LineChartOutlined />, label: "Reports" },
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
