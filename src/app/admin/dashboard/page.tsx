'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useAdminOutlet } from '@/store/AdminOutletContext';
import { motion } from 'framer-motion';
import { Store, ShoppingBag, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { PUBLIC_API_URL } from '@/lib/public-api-url';

interface DashboardStats {
  todayOrders: number;
  pendingOrders: number;
  totalMenuItems: number;
  availableMenuItems: number;
}

interface RecentOrder {
  _id: string;
  studentId: {
    name: string;
  };
  totalAmount: number;
  status: string;
  placedAt: string;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    scopeReady,
    loadingOutlets,
    outletsError,
    adminHeaders,
    selectedOutletId,
  } = useAdminOutlet();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setFetchError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${PUBLIC_API_URL}/api/admin/dashboard/stats`, {
        headers: adminHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to load dashboard');
      }
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
    } catch (error) {
      setStats(null);
      setRecentOrders([]);
      setFetchError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [adminHeaders]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'outlet_admin' && user.role !== 'super_admin')) {
      router.push('/login');
      return;
    }
    if (!scopeReady) {
      if (!loadingOutlets && outletsError) setIsLoading(false);
      return;
    }
    fetchDashboardData();
  }, [
    authLoading,
    user,
    router,
    scopeReady,
    loadingOutlets,
    outletsError,
    selectedOutletId,
    fetchDashboardData,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'text-blue-600 bg-blue-50';
      case 'accepted': return 'text-yellow-600 bg-yellow-50';
      case 'preparing': return 'text-orange-600 bg-orange-50';
      case 'ready': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (authLoading || loadingOutlets) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (
    user &&
    (user.role === 'outlet_admin' || user.role === 'super_admin') &&
    outletsError
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-center text-red-600 text-sm">
          Could not load outlets. Use the bar above to retry.
        </p>
      </div>
    );
  }

  if (
    user &&
    (user.role === 'outlet_admin' || user.role === 'super_admin') &&
    !scopeReady
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-center text-gray-600 text-sm">
          Select an outlet above to load the dashboard.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-wrap items-center justify-between gap-3">
            <span>{fetchError}</span>
            <button
              type="button"
              onClick={() => fetchDashboardData()}
              className="font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Store className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Store
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.todayOrders || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Menu Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMenuItems || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.availableMenuItems || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => router.push('/admin/dashboard/orders')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Orders</h3>
                <p className="text-sm text-gray-600 mt-1">View and update order status</p>
              </div>
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => router.push('/admin/dashboard/menu')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Menu</h3>
                <p className="text-sm text-gray-600 mt-1">Add, edit, or remove menu items</p>
              </div>
              <Store className="h-6 w-6 text-green-600" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => router.push('/admin/dashboard/settings')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Store Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Update store information</p>
              </div>
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </motion.button>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No orders yet
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.studentId.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      ₹{order.totalAmount} • {new Date(order.placedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
