import type { User } from "./auth";

export interface Account extends User {}

export interface AccountPayload {
  username: string;
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  account_status?: string;
}
