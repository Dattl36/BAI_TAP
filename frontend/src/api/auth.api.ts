import { axiosClient, request } from "./axiosClient";
import type { LoginCredentials, LoginResponse, RegisterPayload, User } from "../types/auth";

export const authApi = {
  login(payload: LoginCredentials) {
    return request<LoginResponse>(axiosClient.post("/api/auth/login/", payload));
  },
  register(payload: RegisterPayload) {
    return request<{ message: string; phone: string; otp_code: string; id: number }>(axiosClient.post("/api/auth/register/", payload));
  },
  verifyOtp(payload: { phone: string; otp: string }) {
    return request<LoginResponse>(axiosClient.post("/api/auth/verify-otp/", payload));
  },
  resendOtp(payload: { phone: string }) {
    return request<{ message: string; otp_code: string }>(axiosClient.post("/api/auth/resend-otp/", payload));
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
