import { Button, Result } from "antd";
import { Link } from "react-router-dom";

import { ROUTES } from "../../constants/routes";

export const NotFoundPage = () => (
  <Result
    status="404"
    title="404"
    subTitle="The page you requested does not exist."
    extra={
      <Button type="primary">
        <Link to={ROUTES.dashboard}>Back to dashboard</Link>
      </Button>
    }
  />
);
