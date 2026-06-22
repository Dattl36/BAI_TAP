import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Layout } from "antd";
import { type ReactNode, useState } from "react";

import { useResponsive } from "../hooks/useResponsive";

interface ResponsiveSidebarLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  sidebarWidth?: number;
  sidebarClassName?: string;
  logo?: ReactNode;
}

export const ResponsiveSidebarLayout = ({
  sidebar,
  header,
  children,
  sidebarWidth = 260,
  sidebarClassName = "app-sidebar",
  logo,
}: ResponsiveSidebarLayoutProps) => {
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(false);

  const sidebarContent = (
    <>
      {logo}
      <div onClick={() => setOpen(false)}>{sidebar}</div>
    </>
  );

  return (
    <Layout className="app-shell responsive-shell">
      {!isMobile && (
        <Layout.Sider width={sidebarWidth} className={sidebarClassName}>
          {sidebarContent}
        </Layout.Sider>
      )}

      <Layout className="responsive-shell__main">
        {isMobile && (
          <>
            <Button
              className="mobile-menu-trigger"
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setOpen(true)}
              aria-label="Mo menu"
            />
            <Drawer
              className={`mobile-sidebar-drawer ${sidebarClassName}`}
              placement="left"
              open={open}
              onClose={() => setOpen(false)}
              width="82%"
              styles={{ body: { padding: 0 } }}
            >
              {sidebarContent}
            </Drawer>
          </>
        )}
        {header}
        <Layout.Content className="app-content">{children}</Layout.Content>
      </Layout>
    </Layout>
  );
};
