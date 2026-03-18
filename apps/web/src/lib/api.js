/**
 * Unified API client for all backend calls.
 * Replaces both pocketbaseClient.js and apiServerClient.js.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  _getToken() {
    return localStorage.getItem('auth_token');
  }

  async _request(method, path, body, options = {}) {
    const token = this._getToken();

    const headers = {
      ...(body && !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      const error = new Error(err.error || err.message || 'Request failed');
      error.status = res.status;
      throw error;
    }

    // 204 No Content
    if (res.status === 204) return null;
    return res.json();
  }

  get(path, params) {
    const url = params
      ? `${path}?${new URLSearchParams(params).toString()}`
      : path;
    return this._request('GET', url);
  }

  post(path, body) { return this._request('POST', path, body); }
  put(path, body)  { return this._request('PUT',  path, body); }
  delete(path)     { return this._request('DELETE', path); }

  // Multipart upload helper
  upload(path, formData) {
    return this._request('POST', path, formData);
  }
}

const api = new ApiClient(BASE_URL);

export default api;
export { api };
