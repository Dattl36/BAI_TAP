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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        
        const response = await axios.post(`${apiBaseUrl}/api/auth/token/refresh/`, { refresh: refreshToken });
        const { access } = response.data;
        
        tokenService.setTokens(access, refreshToken);
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        processQueue(null, access);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
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
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
