import { storage } from "../utils/storage";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenService = {
  getAccessToken() {
    return storage.get(ACCESS_TOKEN_KEY);
  },
  getRefreshToken() {
    return storage.get(REFRESH_TOKEN_KEY);
  },
  setTokens(access: string, refresh: string) {
    storage.set(ACCESS_TOKEN_KEY, access);
    storage.set(REFRESH_TOKEN_KEY, refresh);
  },
  clearTokens() {
    storage.remove(ACCESS_TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
  },
};
