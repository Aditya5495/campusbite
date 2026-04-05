'use client';

import React from 'react';
import { useAuth } from '@/store/AuthContext';
import {
  AdminOutletProvider,
  useAdminOutlet,
} from '@/store/AdminOutletContext';

function AdminOutletBar() {
  const { user } = useAuth();
  const {
    outlets,
    selectedOutletId,
    setSelectedOutletId,
    loadingOutlets,
    outletsError,
    refetchOutlets,
    scopeReady,
  } = useAdminOutlet();

  if (!user || (user.role !== 'outlet_admin' && user.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5">
      {outletsError ? (
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 text-sm text-red-700">
          <span>{outletsError}</span>
          <button
            type="button"
            onClick={refetchOutlets}
            className="font-semibold text-red-800 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : loadingOutlets ? (
        <div className="max-w-7xl mx-auto text-sm text-gray-600">Loading outlets…</div>
      ) : user.role === 'super_admin' && outlets.length > 0 ? (
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-800">Managing outlet</span>
          <select
            value={selectedOutletId ?? ''}
            onChange={(e) => setSelectedOutletId(e.target.value)}
            className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm shadow-sm"
          >
            {outlets.map((o) => (
              <option key={o._id} value={o._id}>
                {o.name}
              </option>
            ))}
          </select>
          {!scopeReady && (
            <span className="text-xs text-amber-900">Pick an outlet to load dashboard data.</span>
          )}
        </div>
      ) : user.role === 'outlet_admin' && outlets[0] ? (
        <div className="max-w-7xl mx-auto text-sm text-gray-800">
          <span className="font-semibold">Outlet:</span> {outlets[0].name}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto text-sm text-amber-900">
          No outlets available for this account.
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminOutletProvider>
      <AdminOutletBar />
      {children}
    </AdminOutletProvider>
  );
}
