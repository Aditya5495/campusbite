"use client";

import React, { useState } from "react";
import Link from "next/link";
import RemoteFillImage from "@/components/common/RemoteFillImage";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/CartContext";
import { useAuth } from "@/store/AuthContext";
import { 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  Zap, 
  CalendarDays, 
  ChevronRight,
  ShoppingCart,
  AlertCircle
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { PUBLIC_API_URL } from "@/lib/public-api-url";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  
  const [orderType, setOrderType] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledTime, setScheduledTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (orderType === 'scheduled' && !scheduledTime) {
      setError("Please select a pickup time for your scheduled order.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const orderData = {
        outletId: items[0].outletId, // Assuming all items are from the same outlet
        items: items.map(item => ({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        orderType,
        scheduledPickupTime: orderType === 'scheduled' ? new Date(scheduledTime).toISOString() : undefined,
        totalAmount: totalPrice,
        estimatedPrepTime: items.reduce((max, item) => Math.max(max, item.prepTime), 0)
      };

      const response = await fetch(`${PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('accessToken') ?? localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to place order");
      }

      clearCart();
      router.push("/orders");
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="h-24 w-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={40} className="text-orange-200" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some delicious items from campus outlets to get started.</p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold transition-colors"
        >
          Browse Outlets <ChevronRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            {items.map((item, index) => (
              <div 
                key={item._id}
                className={cn(
                  "p-6 flex items-center gap-4",
                  index !== items.length - 1 && "border-b border-gray-50"
                )}
              >
                <div className="h-20 w-24 bg-gray-100 rounded-2xl overflow-hidden relative shrink-0">
                  <RemoteFillImage
                    src={item.image && item.image.startsWith('http') 
                      ? item.image 
                      : `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop`}
                    alt={item.name}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      item.isVeg ? "bg-green-500" : "bg-red-500"
                    )} />
                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{formatCurrency(item.price)}</p>
                  
                  <div className="flex items-center gap-3 bg-orange-50 text-orange-600 rounded-lg w-fit px-2 py-1 border border-orange-100">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-0.5 hover:bg-orange-100 rounded transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-bold min-w-[1ch] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-0.5 hover:bg-orange-100 rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900 mb-2">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Options */}
        <div className="space-y-6">
          {/* Order Type Selection */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Pickup Type</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setOrderType('instant')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                  orderType === 'instant' 
                    ? "border-orange-500 bg-orange-50 text-orange-600" 
                    : "border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200"
                )}
              >
                <Zap size={24} />
                <span className="text-xs font-bold">Instant</span>
              </button>
              <button
                onClick={() => setOrderType('scheduled')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                  orderType === 'scheduled' 
                    ? "border-orange-500 bg-orange-50 text-orange-600" 
                    : "border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200"
                )}
              >
                <CalendarDays size={24} />
                <span className="text-xs font-bold">Scheduled</span>
              </button>
            </div>

            {orderType === 'scheduled' && (
              <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-bold text-gray-700">Select Pickup Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none transition-all bg-gray-50 text-sm"
                  min={new Date().toISOString().slice(0, 16)}
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                  * Food preparation will start automatically based on the outlet's preparation time to ensure it's fresh when you arrive.
                </p>
              </div>
            )}

            <div className="space-y-3 text-sm border-t pt-6">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform Fee</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>Place Order <ChevronRight size={20} /></>
              )}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
            <div className="flex items-center gap-3 text-blue-700 mb-2 font-bold">
              <Clock size={20} />
              <span>Did you know?</span>
            </div>
            <p className="text-blue-600 text-sm leading-relaxed">
              Scheduled orders help outlets manage demand better, ensuring your food is ready exactly when you walk in!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
