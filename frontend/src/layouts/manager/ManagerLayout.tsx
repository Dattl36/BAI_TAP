import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import { ManagerHeader } from "./ManagerHeader";
import { ManagerNavigation } from "./ManagerNavigation";

export const ManagerLayout = () => (
  <Layout className="app-shell">
    <Layout.Sider 
      width={260} 
      className="app-sidebar"
    >
      <div 
        style={{ 
          height: "var(--app-header-height)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          borderBottom: "1px solid #232220",
          fontFamily: "'Outfit', serif",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.15em",
          color: "var(--color-primary)",
          background: "rgba(20, 20, 18, 0.5)"
        }}
      >
        S A L O N
      </div>
      <ManagerNavigation />
    </Layout.Sider>
    <Layout>
      <ManagerHeader />
      <Layout.Content className="app-content">
        <Outlet />
      </Layout.Content>
    </Layout>
  </Layout>
);
