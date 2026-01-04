// Simple API client wrapper with optional base URL and auto Authorization
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || '';

function getToken(): string | null {
  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

async function request<T=any>(url: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(`${BASE}${url}`, { ...opts, headers });
  // NOTE: Do not auto-delete tokens on 401.
  // A 401 can be caused by temporary backend issues, clock skew, CORS/proxy differences,
  // or an endpoint that doesn't accept the token format. Deleting the token here makes
  // debugging much harder and can create a permanent 401 loop.
  const contentType = resp.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await resp.json() : (await resp.text() as any);
  if (!resp.ok) {
    const message = (data && (data.detail || data.message)) || resp.statusText;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  get: <T=any>(url: string, params?: Record<string, any>) => {
    const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return request<T>(`${url}${qs}`, { method: 'GET' });
  },
  post: <T=any>(url: string, body?: any) => request<T>(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body || {}) }),
  put:  <T=any>(url: string, body?: any) => request<T>(url, { method: 'PUT',  body: JSON.stringify(body || {}) }),
  patch:<T=any>(url: string, body?: any) => request<T>(url, { method: 'PATCH',body: JSON.stringify(body || {}) }),
  delete:<T=any>(url: string) => request<T>(url, { method: 'DELETE' }),
};
