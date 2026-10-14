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

const API_BASE_URL =
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
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    // Translate raw RBAC denial payloads into human-readable messages
    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
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
};
