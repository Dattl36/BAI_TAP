import { Navigate } from "react-router-dom";
import { useMe } from "../../hooks/useMe";
import { PageLoading } from "../../components/common/PageLoading";
import { ROLES } from "../../constants/roles";

export const DashboardRedirect = () => {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case ROLES.CUSTOMER:
      return <Navigate to="/customer" replace />;
    case ROLES.RECEPTIONIST:
      return <Navigate to="/receptionist" replace />;
    case ROLES.STAFF:
      return <Navigate to="/staff" replace />;
    case ROLES.MANAGER:
      return <Navigate to="/manager" replace />;
    default:
      return <Navigate to="/403" replace />;
  }
};
