import { Card, List } from "antd";
import { Link } from "react-router-dom";

import { PageHeader } from "../../components/common/PageHeader";
import { ROUTES } from "../../constants/routes";

const reportLinks = [
  { title: "Revenue", path: `${ROUTES.reports}/revenue` },
  { title: "Appointments", path: `${ROUTES.reports}/appointments` },
  { title: "Services", path: `${ROUTES.reports}/services` },
  { title: "Customers", path: `${ROUTES.reports}/customers` },
  { title: "Staff Performance", path: `${ROUTES.reports}/staff-performance` },
];

export const ReportsPage = () => (
  <>
    <PageHeader title="Reports" description="Manager reporting endpoints." />
    <Card>
      <List
        dataSource={reportLinks}
        renderItem={(item) => (
          <List.Item>
            <Link to={item.path}>{item.title}</Link>
          </List.Item>
        )}
      />
    </Card>
  </>
);
