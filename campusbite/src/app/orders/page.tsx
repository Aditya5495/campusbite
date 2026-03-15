"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/AuthContext";
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  ShoppingBag, 
  ChevronRight,
  Timer,
  AlertCircle
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Order } from "@/types";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5004/api/orders/my-orders", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'placed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'accepted': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'preparing': return 'bg-orange-50 text-orange-600 border-orange-100 border-dashed animate-pulse';
      case 'ready': return 'bg-green-50 text-green-600 border-green-100';
      case 'completed': return 'bg-gray-50 text-gray-600 border-gray-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'placed': return <Timer size={16} />;
      case 'accepted': return <CheckCircle2 size={16} />;
      case 'preparing': return <ChefHat size={16} />;
      case 'ready': return <ShoppingBag size={16} />;
      case 'completed': return <CheckCircle2 size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 w-1/4 rounded mb-8" />
        {[1, 2].map(i => (
          <div key={i} className="h-48 bg-gray-200 rounded-3xl" />
        ))}
      </div>
    );
  }

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders</h1>

      {activeOrders.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Active Orders</h2>
          <div className="space-y-6">
            {activeOrders.map(order => (
              <div key={order._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Order #{order._id.split('_')[1]}
                        </span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5",
                          getStatusColor(order.status)
                        )}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.orderType === 'scheduled' ? 'Scheduled Pickup' : 'Instant Order'}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs text-gray-500">{order.items.length} items</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-400">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">
                          {order.orderType === 'scheduled' ? 'Pickup Time' : 'Estimated Ready'}
                        </p>
                        <p className="text-sm font-black text-gray-900">
                          {order.scheduledPickupTime 
                            ? new Date(order.scheduledPickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : "In ~" + order.estimatedPrepTime + " mins"}
                        </p>
                      </div>
                    </div>
                    <button className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden divide-y divide-gray-50 shadow-sm">
          {pastOrders.length > 0 ? (
            pastOrders.map(order => (
              <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-orange-500 transition-colors">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Order #{order._id.split('_')[1]}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(order.placedAt).toLocaleDateString()} • {order.items.length} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        order.status === 'completed' ? "text-green-500" : "text-red-500"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-400 font-medium">No past orders yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
