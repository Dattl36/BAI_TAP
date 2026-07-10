import { Outlet } from "react-router-dom";

import { ResponsiveSidebarLayout } from "../ResponsiveSidebarLayout";
import { StaffHeader } from "./StaffHeader";
import { StaffNavigation } from "./StaffNavigation";

export const StaffLayout = () => (
  <ResponsiveSidebarLayout
    sidebar={<StaffNavigation />}
    header={<StaffHeader />}
    sidebarWidth={230}
    sidebarClassName="staff-sidebar"
    logo={<div className="app-logo app-logo--light">S A L O N</div>}
  >
    <Outlet />
  </ResponsiveSidebarLayout>
);
