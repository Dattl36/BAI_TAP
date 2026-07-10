import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import { MobileBottomNav } from "../../components/responsive/MobileBottomNav";
import { CustomerHeader } from "./CustomerHeader";
import { CustomerNavigation } from "./CustomerNavigation";

export const CustomerLayout = () => (
  <Layout className="app-shell" style={{ background: "var(--color-bg)" }}>
    <CustomerHeader />
    <div className="customer-top-nav">
      <div className="customer-top-nav__inner">
        <CustomerNavigation />
      </div>
    </div>
    <Layout.Content 
      className="customer-content"
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
    <MobileBottomNav />
  </Layout>
);
