import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import { ReceptionistHeader } from "./ReceptionistHeader";
import { ReceptionistNavigation } from "./ReceptionistNavigation";

export const ReceptionistLayout = () => (
  <Layout className="app-shell">
    <Layout.Sider
      width={220}
      className="rcpt-sidebar"
      style={{ minHeight: "100vh" }}
    >
      <div className="rcpt-sidebar-logo">
        <span className="logo-icon">✦</span>
        S A L O N
      </div>
      <ReceptionistNavigation />
    </Layout.Sider>
    <Layout>
      <ReceptionistHeader />
      <Layout.Content className="app-content">
        <Outlet />
      </Layout.Content>
    </Layout>
  </Layout>
);
