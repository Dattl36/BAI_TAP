import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import { StaffHeader } from "./StaffHeader";
import { StaffNavigation } from "./StaffNavigation";

export const StaffLayout = () => (
  <Layout className="app-shell">
    <Layout.Sider 
      width={230} 
      className="staff-sidebar"
      style={{ 
        boxShadow: "0 4px 20px rgba(0,0,0,0.01)"
      }}
    >
      <div 
        style={{ 
          height: "var(--app-header-height)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          borderBottom: "1px solid var(--app-border)",
          fontFamily: "'Outfit', serif",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "0.2em",
          color: "var(--color-primary)"
        }}
      >
        ✦ S A L O N ✦
      </div>
      <StaffNavigation />
    </Layout.Sider>
    <Layout>
      <StaffHeader />
      <Layout.Content className="app-content" style={{ background: "var(--color-bg)", padding: 24, overflowY: "auto" }}>
        <Outlet />
      </Layout.Content>
    </Layout>
  </Layout>
);

