import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import { CustomerHeader } from "./CustomerHeader";
import { CustomerNavigation } from "./CustomerNavigation";

export const CustomerLayout = () => (
  <Layout className="app-shell" style={{ background: "var(--color-bg)" }}>
    <CustomerHeader />
    <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--app-border)", zIndex: 10 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "center" }}>
        <CustomerNavigation />
      </div>
    </div>
    <Layout.Content 
      style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: "32px 24px", 
        width: "100%", 
        minHeight: "calc(100vh - 136px)",
        boxSizing: "border-box"
      }}
    >
      <Outlet />
    </Layout.Content>
  </Layout>
);
