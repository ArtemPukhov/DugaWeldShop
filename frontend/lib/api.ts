export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dw_admin_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dw_admin_refresh");
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set("Authorization", `Bearer ${getToken()}`);
      res = await fetch(`/api${path}`, { ...options, headers: retryHeaders });
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return (await res.json()) as T;
  // @ts-expect-error allow non-json
  return undefined as T;
}

export async function apiFetchJSON<T = unknown>(
  path: string,
  method: HttpMethod,
  body?: unknown
): Promise<T> {
  const token = getToken();
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 || res.status === 403) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryHeaders = new Headers({ "Content-Type": "application/json" });
      retryHeaders.set("Authorization", `Bearer ${getToken()}`);
      res = await fetch(`/api${path}`, {
        method,
        headers: retryHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function apiFetchForm<T = unknown>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res = await fetch(`/api${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (res.status === 401 || res.status === 403) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryHeaders = new Headers();
      retryHeaders.set("Authorization", `Bearer ${getToken()}`);
      res = await fetch(`/api${path}`, { method: "POST", headers: retryHeaders, body: formData });
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("dw_admin_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("dw_admin_token");
  localStorage.removeItem("dw_admin_refresh");
}

export async function apiLogout(): Promise<void> {
  try {
    const refresh = getRefreshToken();
    await fetch(`/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh || "" }),
    });
  } catch {}
  clearToken();
}

export function hasToken(): boolean {
  return Boolean(getToken());
}

export function saveRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("dw_admin_refresh", token);
}

async function tryRefreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { token: string; refreshToken?: string };
    saveToken(data.token);
    if (data.refreshToken) saveRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}



