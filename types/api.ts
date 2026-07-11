/**
 * Shared API error and pagination types.
 * Mirrors backend ErrorResponse / PaginatedResponse shapes without
 * duplicating business rules. Feature-specific DTOs belong in later phases.
 */

export interface ApiErrorDetail {
  field?: string | null;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details: ApiErrorDetail[];
  request_id?: string | null;
  status?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedResponse<T> extends PaginationMeta {
  items: T[];
}
