import { Button, Result } from "antd";
import { Link } from "react-router-dom";

import { ROUTES } from "../../constants/routes";

export const ForbiddenPage = () => (
  <Result
    status="403"
    title="403"
    subTitle="Bạn không có quyền truy cập trang này."
    extra={
      <Button type="primary">
        <Link to={ROUTES.dashboard}>Back to dashboard</Link>
      </Button>
    }
  />
);
