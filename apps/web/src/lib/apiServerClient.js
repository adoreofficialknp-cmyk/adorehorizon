/**
 * COMPATIBILITY SHIM
 * Old code used apiServerClient.fetch('/some/path', options)
 * This shim keeps that working.
 */
import api from './api.js';

const apiServerClient = {
  fetch: async (url, options = {}) => {
    return window.fetch(`/api${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(localStorage.getItem('auth_token')
          ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
          : {}),
      },
    });
  },
};

export default apiServerClient;
export { apiServerClient };
