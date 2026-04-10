import type {
  User,
  UserCreate,
  ChildProfile,
  ChildProfileCreate,
  ChildProfileUpdate,
  GeneratedBook,
  BookCreate,
  PaginatedResponse,
} from 'shared-types';

import { API_URL } from '../utils/constants';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from './auth';

// ─── Types ───

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// ─── API Error ───

export class ApiError extends Error {
  status: number;
  code: string;
  retryable: boolean;

  constructor(status: number, code: string, message: string, retryable: boolean) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

// ─── Fetch Wrapper ───

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    await storeTokens(data);
    return true;
  } catch {
    return false;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (requiresAuth) {
    const token = await getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = `${API_URL}${path}`;
  let response = await fetch(url, { ...options, headers });

  // Handle 401 with token refresh
  if (response.status === 401 && requiresAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      const newToken = await getAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
      }
      response = await fetch(url, { ...options, headers });
    } else {
      await clearTokens();
      throw new ApiError(401, 'UNAUTHORIZED', 'Session expired. Please log in again.', false);
    }
  }

  if (!response.ok) {
    let errorBody: { error?: { code?: string; message?: string; retryable?: boolean } } = {};
    try {
      errorBody = await response.json();
    } catch {
      // Response body may not be JSON
    }
    throw new ApiError(
      response.status,
      errorBody.error?.code || 'UNKNOWN',
      errorBody.error?.message || `Request failed with status ${response.status}`,
      errorBody.error?.retryable ?? false,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ─── Auth Endpoints ───

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, false);
}

export async function register(data: UserCreate): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }, false);
}

export async function getProfile(): Promise<User> {
  return apiFetch<User>('/api/v1/auth/me');
}

// ─── Children Endpoints ───

export async function getChildren(): Promise<ChildProfile[]> {
  const response = await apiFetch<PaginatedResponse<ChildProfile>>(
    '/api/v1/children',
  );
  return response.data;
}

export async function getChild(childId: string): Promise<ChildProfile> {
  return apiFetch<ChildProfile>(`/api/v1/children/${childId}`);
}

export async function createChild(data: ChildProfileCreate): Promise<ChildProfile> {
  return apiFetch<ChildProfile>('/api/v1/children', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateChild(
  childId: string,
  data: ChildProfileUpdate,
): Promise<ChildProfile> {
  return apiFetch<ChildProfile>(`/api/v1/children/${childId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Books Endpoints ───

export async function getBooks(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<GeneratedBook>> {
  return apiFetch<PaginatedResponse<GeneratedBook>>(
    `/api/v1/books?page=${page}&page_size=${pageSize}`,
  );
}

export async function getBookDetail(bookId: string): Promise<GeneratedBook> {
  return apiFetch<GeneratedBook>(`/api/v1/books/${bookId}`);
}

export async function createBook(data: BookCreate): Promise<GeneratedBook> {
  return apiFetch<GeneratedBook>('/api/v1/books', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
