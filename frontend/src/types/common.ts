export type EntityId = number | string;

export interface BaseEntity {
  id: EntityId;
  created_at?: string;
  updated_at?: string;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ListResponse<T> = T[] | PaginatedResponse<T>;

export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface SelectOption {
  label: string;
  value: string | number;
}
