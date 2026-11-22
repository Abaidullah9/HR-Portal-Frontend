export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationMeta;
}

/** Fired when the API answers 401, so the shell can end the session. */
export const SESSION_EXPIRED_EVENT = 'hr:session-expired';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function request<T, B = unknown>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: B;
    headers?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: `Request failed with status ${response.status}`,
  }));

  if (!response.ok || !data.success) {
    // An expired cookie otherwise leaves the page rendering empty panels, so
    // announce it once and let the shell redirect.
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
      throw new ApiError('Your session has expired. Sign in again to continue.', 401);
    }
    // Translate raw RBAC denial payloads into human-readable messages
    if (response.status === 403) {
      throw new ApiError('You do not have permission to perform this action.', 403);
    }
    throw new ApiError(
      data.message || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return data;
}

export const apiClient = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', headers }),

  post: <T, B = unknown>(endpoint: string, body?: B, headers?: Record<string, string>) =>
    request<T, B>(endpoint, { method: 'POST', body, headers }),

  patch: <T, B = unknown>(endpoint: string, body?: B, headers?: Record<string, string>) =>
    request<T, B>(endpoint, { method: 'PATCH', body, headers }),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'DELETE', headers }),

  /**
   * Authenticated file/blob download. Keeps the httpOnly session cookie and
   * fails the same way the JSON methods do, so a 403 cannot be mistaken for a
   * corrupt file.
   */
  download: async (endpoint: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
      throw new ApiError(
        response.status === 403
          ? 'You do not have permission to download this file.'
          : `Download failed with status ${response.status}`,
        response.status,
      );
    }
    return response.blob();
  },
};
