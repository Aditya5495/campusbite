'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/store/AuthContext';
import { PUBLIC_API_URL } from '@/lib/public-api-url';
import {
  getAdminHeaders,
  getStoredAdminOutletId,
  setStoredAdminOutletId,
} from '@/lib/admin-api';
import type { Outlet } from '@/types';

interface AdminOutletContextValue {
  outlets: Outlet[];
  selectedOutletId: string | null;
  setSelectedOutletId: (id: string) => void;
  loadingOutlets: boolean;
  outletsError: string | null;
  refetchOutlets: () => void;
  /** True when admin can call scoped APIs (outlet picked for super_admin, or outlet_admin loaded). */
  scopeReady: boolean;
  adminHeaders: () => Record<string, string>;
}

const AdminOutletContext = createContext<AdminOutletContextValue | null>(null);

export function AdminOutletProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutletId, setSelectedOutletIdState] = useState<string | null>(null);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [outletsError, setOutletsError] = useState<string | null>(null);
  const [fetchNonce, setFetchNonce] = useState(0);

  const isAdmin =
    user?.role === 'outlet_admin' || user?.role === 'super_admin';

  const refetchOutlets = useCallback(() => {
    setFetchNonce((n) => n + 1);
  }, []);

  const setSelectedOutletId = useCallback((id: string) => {
    setSelectedOutletIdState(id);
    if (user?.role === 'super_admin') {
      setStoredAdminOutletId(id);
    }
  }, [user?.role]);

  useEffect(() => {
    if (authLoading || !user || !isAdmin) {
      setOutlets([]);
      setSelectedOutletIdState(null);
      setLoadingOutlets(false);
      setOutletsError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingOutlets(true);
      setOutletsError(null);
      try {
        const res = await fetch(`${PUBLIC_API_URL}/api/admin/outlets`, {
          headers: getAdminHeaders(user.role, null),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load outlets');
        }
        const list: Outlet[] = data.outlets || [];
        if (cancelled) return;
        setOutlets(list);

        if (user.role === 'outlet_admin') {
          const id = list[0]?._id?.toString() ?? null;
          setSelectedOutletIdState(id);
          return;
        }

        if (user.role === 'super_admin') {
          const stored = getStoredAdminOutletId();
          const validStored = stored && list.some((o) => o._id === stored);
          const pick = validStored ? stored : list[0]?._id?.toString() ?? null;
          setSelectedOutletIdState(pick);
          if (pick && !validStored && list.length) {
            setStoredAdminOutletId(pick);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setOutletsError(e instanceof Error ? e.message : 'Failed to load outlets');
          setOutlets([]);
          setSelectedOutletIdState(null);
        }
      } finally {
        if (!cancelled) setLoadingOutlets(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, isAdmin, fetchNonce]);

  const scopeReady = Boolean(
    isAdmin &&
      !loadingOutlets &&
      !outletsError &&
      outlets.length > 0 &&
      selectedOutletId
  );

  const adminHeaders = useCallback(
    () => getAdminHeaders(user?.role, user?.role === 'super_admin' ? selectedOutletId : null),
    [user?.role, selectedOutletId]
  );

  const value = useMemo<AdminOutletContextValue>(
    () => ({
      outlets,
      selectedOutletId,
      setSelectedOutletId,
      loadingOutlets,
      outletsError,
      refetchOutlets,
      scopeReady,
      adminHeaders,
    }),
    [
      outlets,
      selectedOutletId,
      setSelectedOutletId,
      loadingOutlets,
      outletsError,
      refetchOutlets,
      scopeReady,
      adminHeaders,
    ]
  );

  return (
    <AdminOutletContext.Provider value={value}>{children}</AdminOutletContext.Provider>
  );
}

export function useAdminOutlet() {
  const ctx = useContext(AdminOutletContext);
  if (!ctx) {
    throw new Error('useAdminOutlet must be used within AdminOutletProvider');
  }
  return ctx;
}
