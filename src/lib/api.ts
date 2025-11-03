// src/lib/api.ts
const API = process.env.REACT_APP_API_URL || 'http://localhost:5174';

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listReflections() {
  const r = await fetch(`${API}/api/reflections`);
  return r.json();
}

export async function getReflection(id: string) {
  const r = await fetch(`${API}/api/reflections/${id}`);
  if (!r.ok) throw new Error('Not found');
  return r.json();
}

export async function upsertReflection(token: string, id: string | null, payload: any) {
  const r = await fetch(`${API}/api/reflections${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Save failed');
  return r.json();
}

export async function deleteReflection(token: string, id: string) {
  const r = await fetch(`${API}/api/reflections/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token) as HeadersInit,
  });
  if (!r.ok) throw new Error('Delete failed');
  return r.json();
}
