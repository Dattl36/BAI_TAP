import { useNavigate } from "react-router-dom";

import { ROUTES } from "../constants/routes";
import { tokenService } from "../services/token.service";

export const useAuth = () => {
  const navigate = useNavigate();

  return {
    isAuthenticated: Boolean(tokenService.getAccessToken()),
    logout() {
      tokenService.clearTokens();
      navigate(ROUTES.login, { replace: true });
    },
  };
};
