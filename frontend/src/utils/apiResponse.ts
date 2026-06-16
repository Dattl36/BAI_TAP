import type { ListResponse, PaginatedResponse } from "../types/common";

export const normalizePaginatedResponse = <T>(
  data: ListResponse<T> | null | undefined
): PaginatedResponse<T> => {
  if (!data) {
    return { count: 0, next: null, previous: null, results: [] };
  }

  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }

  return {
    count: typeof data.count === "number" ? data.count : (data.results?.length ?? 0),
    next: data.next ?? null,
    previous: data.previous ?? null,
    results: Array.isArray(data.results) ? data.results : [],
  };
};

/** Returns just the results array from any API response shape. */
export const getListItems = <T>(data: ListResponse<T> | null | undefined): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};

/** Returns the total count from any API response shape. */
export const getListCount = <T>(data: ListResponse<T> | null | undefined): number => {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (typeof data.count === "number") return data.count;
  if (Array.isArray(data.results)) return data.results.length;
  return 0;
};
