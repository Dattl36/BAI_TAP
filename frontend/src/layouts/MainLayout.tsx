import { Outlet } from "react-router-dom";

import { HeaderBar } from "./HeaderBar";
import { ResponsiveSidebarLayout } from "./ResponsiveSidebarLayout";
import { SidebarMenu } from "./Sidebar";

export const MainLayout = () => (
  <ResponsiveSidebarLayout sidebar={<SidebarMenu />} header={<HeaderBar />} logo={<div className="app-logo">S A L O N</div>}>
    <Outlet />
  </ResponsiveSidebarLayout>
);
