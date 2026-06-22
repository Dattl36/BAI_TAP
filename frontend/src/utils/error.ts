import { AxiosError } from "axios";

interface ApiErrorResponse {
  code?: string;
  message?: string;
  detail?: string;
  details?: unknown;
  non_field_errors?: string[];
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

const normalizeMessages = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (value && typeof value === "object") return [JSON.stringify(value)];
  if (value === undefined || value === null || value === "") return [];
  return [String(value)];
};

export function getFieldErrors(error: unknown): Record<string, string[]> {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const data = axiosError?.response?.data;
  const details = data?.error?.details ?? data?.details ?? data;

  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return {};
  }

  const fieldErrors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(details as Record<string, unknown>)) {
    if (["error", "detail", "message", "code"].includes(key)) continue;
    const messages = normalizeMessages(value);
    if (messages.length > 0) {
      fieldErrors[key] = messages;
    }
  }

  return fieldErrors;
}

export function getErrorMessage(error: unknown): string {
  if (!error) return "Đã xảy ra lỗi. Vui lòng thử lại.";
  if (typeof error === "string") return error;

  const fieldErrors = getFieldErrors(error);
  const fieldMessages = Object.entries(fieldErrors).map(([field, messages]) => `${field}: ${messages.join(", ")}`);
  if (fieldMessages.length > 0) {
    return fieldMessages.join(" | ");
  }

  const axiosError = error as AxiosError<ApiErrorResponse>;
  const data = axiosError?.response?.data;

  if (data) {
    if (typeof data === "string") return data;
    if (data.error?.message) return data.error.message;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors.join(", ");
    }
  }

  if (error instanceof Error) return error.message;

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}
