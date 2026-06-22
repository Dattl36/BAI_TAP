import { Outlet } from "react-router-dom";

import { ResponsiveSidebarLayout } from "../ResponsiveSidebarLayout";
import { ManagerHeader } from "./ManagerHeader";
import { ManagerNavigation } from "./ManagerNavigation";

export const ManagerLayout = () => (
  <ResponsiveSidebarLayout sidebar={<ManagerNavigation />} header={<ManagerHeader />} logo={<div className="app-logo">S A L O N</div>}>
    <Outlet />
  </ResponsiveSidebarLayout>
);
