import { useQuery } from "@tanstack/react-query";

import { authApi } from "../api/auth.api";
import { queryKeys } from "../constants/queryKeys";
import { tokenService } from "../services/token.service";

export const useMe = () =>
  useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getMe,
    enabled: Boolean(tokenService.getAccessToken()),
  });
