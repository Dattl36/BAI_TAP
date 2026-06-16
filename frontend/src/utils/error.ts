import { AxiosError } from "axios";

interface ApiErrorResponse {
  code?: string;
  message?: string;
  detail?: string;
  details?: unknown;
  non_field_errors?: string[];
  error?: any;
}

export function getErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  // Already a plain string
  if (typeof error === "string") return error;

  const axiosError = error as AxiosError<ApiErrorResponse>;
  const data = axiosError?.response?.data;

  if (data) {
    if (typeof data === "string") return data;
    if (data.error) {
      const apiErr = data.error;
      if (apiErr.details && typeof apiErr.details === "object") {
        const detailMessages: string[] = [];
        for (const key of Object.keys(apiErr.details)) {
          const val = apiErr.details[key];
          const msg = Array.isArray(val) ? val.join(", ") : String(val);
          detailMessages.push(`${key}: ${msg}`);
        }
        if (detailMessages.length > 0) {
          return detailMessages.join(" | ");
        }
      }
      if (apiErr.message) return apiErr.message;
    }
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors.join(", ");
    }
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}
