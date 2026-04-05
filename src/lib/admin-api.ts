import type { User } from '@/types';

const STORAGE_KEY = 'campusbite_admin_outlet_id';

export function getStoredAdminOutletId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredAdminOutletId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, id);
}

export function getAdminHeaders(
  role: User['role'] | undefined,
  outletId: string | null
): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('accessToken') ?? localStorage.getItem('token') ?? ''
      : '';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (role === 'super_admin' && outletId) {
    headers['X-Outlet-Id'] = outletId;
  }
  return headers;
}
