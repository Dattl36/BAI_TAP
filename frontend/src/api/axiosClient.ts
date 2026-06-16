import axios, { type AxiosResponse } from "axios";

import { tokenService } from "../services/token.service";
import type { ApiEnvelope } from "../types/common";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenService.clearTokens();

      const isDashboardRoute =
        window.location.pathname.startsWith("/customer") ||
        window.location.pathname.startsWith("/receptionist") ||
        window.location.pathname.startsWith("/staff") ||
        window.location.pathname.startsWith("/manager") ||
        window.location.pathname === "/dashboard";

      if (isDashboardRoute && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

const isEnvelope = <T>(payload: unknown): payload is ApiEnvelope<T> =>
  typeof payload === "object" && payload !== null && "data" in payload;

export const unwrapApiData = <T>(payload: unknown): T => {
  if (isEnvelope<T>(payload)) {
    return payload.data;
  }

  return payload as T;
};

export const request = async <T>(promise: Promise<AxiosResponse<unknown>>) => {
  const response = await promise;
  return unwrapApiData<T>(response.data);
};
