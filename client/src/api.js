const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('cms_user')); } catch (e) { return null; }
};
export const saveSession = (s) => localStorage.setItem('cms_user', JSON.stringify(s));
export const clearSession = () => localStorage.removeItem('cms_user');

async function request(method, path, body) {
  const user = getUser();
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(user ? { Authorization: 'Bearer ' + user.token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  patch: (p, b) => request('PATCH', p, b),
};
