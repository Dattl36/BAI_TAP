import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import { HeaderBar } from "./HeaderBar";
import { Sidebar } from "./Sidebar";

export const MainLayout = () => (
  <Layout className="app-shell">
    <Sidebar />
    <Layout>
      <HeaderBar />
      <Layout.Content className="app-content">
        <Outlet />
      </Layout.Content>
    </Layout>
  </Layout>
);
