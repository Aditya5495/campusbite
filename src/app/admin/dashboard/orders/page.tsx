'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useAdminOutlet } from '@/store/AdminOutletContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Search, Eye } from 'lucide-react';
import { PUBLIC_API_URL } from '@/lib/public-api-url';

interface Order {
  _id: string;
  studentId: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  orderType: string;
  placedAt: string;
  scheduledPickupTime?: string;
}

export default function OrderManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    scopeReady,
    loadingOutlets,
    outletsError,
    adminHeaders,
    selectedOutletId,
  } = useAdminOutlet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setFetchError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${PUBLIC_API_URL}/api/admin/orders`, {
        headers: adminHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to load orders');
      }
      setOrders(data.orders);
    } catch (error) {
      setOrders([]);
      setFetchError(error instanceof Error ? error.message : 'Failed to load orders');
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
    fetchOrders();
  }, [
    authLoading,
    user,
    router,
    scopeReady,
    loadingOutlets,
    outletsError,
    selectedOutletId,
    fetchOrders,
  ]);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.studentId.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`${PUBLIC_API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'accepted': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'preparing': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'ready': return 'text-green-600 bg-green-50 border-green-200';
      case 'completed': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'placed': 'accepted',
      'accepted': 'preparing',
      'preparing': 'ready',
      'ready': 'completed',
      'completed': null,
      'cancelled': null
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
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
          Select an outlet above to view orders.
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
              onClick={() => fetchOrders()}
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="placed">Placed</option>
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {order.studentId.name}
                        </h3>
                        <p className="text-sm text-gray-600">{order.studentId.email}</p>
                        <p className="text-sm text-gray-600">{order.studentId.phone}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Order Type</p>
                        <p className="font-medium capitalize">{order.orderType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Placed At</p>
                        <p className="font-medium">
                          {new Date(order.placedAt).toLocaleString()}
                        </p>
                      </div>
                      {order.scheduledPickupTime && (
                        <div>
                          <p className="text-sm text-gray-600">Scheduled Pickup</p>
                          <p className="font-medium">
                            {new Date(order.scheduledPickupTime).toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium">₹{order.totalAmount}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Items</p>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.quantity}x {item.name} - ₹{item.price}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 mt-4 lg:mt-0 lg:ml-6">
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => updateOrderStatus(order._id, getNextStatus(order.status)!)}
                        disabled={updatingOrderId === order._id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingOrderId === order._id ? 'Updating...' : `Mark as ${getNextStatus(order.status)}`}
                      </button>
                    )}
                    
                    {order.status === 'placed' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        disabled={updatingOrderId === order._id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingOrderId === order._id ? 'Updating...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
