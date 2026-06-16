import { axiosClient, request } from "./axiosClient";
import type { LoginCredentials, LoginResponse, RegisterPayload, User } from "../types/auth";

export const authApi = {
  login(payload: LoginCredentials) {
    return request<LoginResponse>(axiosClient.post("/api/auth/login/", payload));
  },
  register(payload: RegisterPayload) {
    return request<User>(axiosClient.post("/api/auth/register/", payload));
  },
  logout() {
    return request<null>(axiosClient.post("/api/auth/logout/"));
  },
  getMe() {
    return request<User>(axiosClient.get("/api/auth/me/"));
  },
  updateMe(payload: Partial<User>) {
    return request<User>(axiosClient.patch("/api/auth/me/", payload));
  },
};
