import type { BaseEntity, EntityId } from "./common";

export interface Customer extends BaseEntity {
  user?: EntityId;
  code?: string;
  full_name: string;
  phone?: string;
  email?: string;
  birth_date?: string | null;
  gender?: string;
  address?: string;
  preferences?: string;
  status?: string;
}

export interface CustomerPayload {
  user?: EntityId;
  full_name: string;
  phone?: string;
  email?: string;
  birth_date?: string | null;
  gender?: string;
  address?: string;
  preferences?: string;
  status?: string;
}
