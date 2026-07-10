import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "../constants/routes";
import { tokenService } from "../services/token.service";

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return {
    isAuthenticated: Boolean(tokenService.getAccessToken()),
    logout() {
      tokenService.clearTokens();
      queryClient.clear();
      navigate(ROUTES.login, { replace: true });
    },
  };
};
