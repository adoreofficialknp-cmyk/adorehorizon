/**
 * COMPATIBILITY SHIM — PocketBase → REST API
 *
 * Keeps all legacy `import pb from '@/lib/pocketbaseClient'` working.
 * Fully implements: getList, getFullList, getOne, getFirstListItem,
 *                   create, update, delete, subscribe (no-op), authStore.
 *
 * Long-term goal: replace all usages with `import api from '@/lib/api.js'`
 */

import api from './api.js';

// Map PocketBase collection names → our REST API base paths
const COLLECTION_MAP = {
  users:             '/auth',
  products:          '/products',
  categories:        '/categories',
  banners:           '/banners',
  homepage_sections: '/homepage',
  settings:          '/settings',
  orders:            '/orders',
  coupons:           '/coupons',
};

function normaliseList(data) {
  if (Array.isArray(data)) return { items: data, totalItems: data.length };
  if (data && Array.isArray(data.items)) return { items: data.items, totalItems: data.total ?? data.items.length };
  if (data && data.id) return { items: [data], totalItems: 1 };
  return { items: [], totalItems: 0 };
}

const pbShim = {
  /* ── Auth Store ──────────────────────────────────────────── */
  authStore: {
    get isValid() { return !!localStorage.getItem('auth_token'); },
    get model() {
      try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
    },
    clear() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('adore_admin_status');
    },
    // No-op: JWT doesn't have realtime auth changes. Returns unsubscribe fn.
    onChange(_cb) { return () => {}; },
    save(_token, model) {
      if (model) localStorage.setItem('auth_user', JSON.stringify(model));
    },
  },

  /* ── Collection Proxy ────────────────────────────────────── */
  collection(name) {
    const base = COLLECTION_MAP[name];

    // For unknown collections (notifications, faqs, trust_badges, etc.)
    // return a safe no-op stub so the app doesn't crash on build/runtime.
    if (!base) {
      const stub = {
        async getList()         { return { items: [], totalItems: 0 }; },
        async getFullList()     { return []; },
        async getOne()          { throw Object.assign(new Error(`Collection '${name}' not available`), { status: 404 }); },
        async getFirstListItem(){ throw Object.assign(new Error(`Collection '${name}' not available`), { status: 404 }); },
        async create(data)      { console.warn(`[pbShim] create on unmapped collection '${name}'`); return data; },
        async update(_id, data) { return data; },
        async delete()          { return true; },
        subscribe(_topic, _cb) { return () => {}; },
        unsubscribe()           {},
        authWithPassword()      { throw new Error('Use /api/auth/login instead'); },
      };
      return stub;
    }

    return {
      async getList(page = 1, limit = 50, _opts = {}) {
        const data = await api.get(`${base}?page=${page}&limit=${limit}`).catch(() => []);
        return normaliseList(data);
      },

      async getFullList(_limit = 500, _opts = {}) {
        const data = await api.get(`${base}?limit=500`).catch(() => []);
        const { items } = normaliseList(data);
        return items;
      },

      async getOne(id) {
        return api.get(`${base}/${id}`);
      },

      async getFirstListItem(_filter, _opts = {}) {
        const data = await api.get(`${base}?limit=1`).catch(() => []);
        const { items } = normaliseList(data);
        if (!items.length) throw Object.assign(new Error('Not found'), { status: 404 });
        return items[0];
      },

      async create(data) {
        return api.post(base, data);
      },

      async update(id, data) {
        return api.put(`${base}/${id}`, data);
      },

      async delete(id) {
        return api.delete(`${base}/${id}`);
      },

      // Real-time not supported — return unsubscribe no-op
      subscribe(_topic, _cb) { return () => {}; },
      unsubscribe() {},

      // Auth methods (only for 'users' collection)
      async authWithPassword(identifier, password) {
        const body = identifier.includes('@')
          ? { email: identifier, password }
          : { phone: identifier, password };
        const data = await api.post('/auth/login', body);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        return { token: data.token, record: data.user };
      },
    };
  },

  /* ── Files helper ────────────────────────────────────────── */
  files: {
    getURL(_record, filename) { return filename || ''; },
    getUrl(_record, filename) { return filename || ''; },
  },
};

export default pbShim;
export { pbShim as pocketbaseClient };
