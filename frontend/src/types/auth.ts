import type { Role } from "../constants/roles";
import type { BaseEntity } from "./common";

export interface User extends BaseEntity {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  customer_profile_id?: number | string;
  role: Role;
  account_status?: string;
  is_active?: boolean;
}


export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}
