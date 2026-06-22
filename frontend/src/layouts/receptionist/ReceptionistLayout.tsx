import { Outlet } from "react-router-dom";

import { ResponsiveSidebarLayout } from "../ResponsiveSidebarLayout";
import { ReceptionistHeader } from "./ReceptionistHeader";
import { ReceptionistNavigation } from "./ReceptionistNavigation";

export const ReceptionistLayout = () => (
  <ResponsiveSidebarLayout
    sidebar={<ReceptionistNavigation />}
    header={<ReceptionistHeader />}
    sidebarWidth={220}
    sidebarClassName="rcpt-sidebar"
    logo={<div className="rcpt-sidebar-logo">S A L O N</div>}
  >
    <Outlet />
  </ResponsiveSidebarLayout>
);
