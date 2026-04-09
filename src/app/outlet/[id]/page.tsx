"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import RemoteFillImage from "@/components/common/RemoteFillImage";
import { useParams } from "next/navigation";
import { 
  Clock, 
  Star, 
  MapPin, 
  Info, 
  Leaf, 
  Flame, 
  Plus, 
  Minus,
  ShoppingCart,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Outlet, MenuItem } from "@/types";
import { useCart } from "@/store/CartContext";
import { formatCurrency, cn } from "@/lib/utils";
import { PUBLIC_API_URL } from "@/lib/public-api-url";

function paramId(params: Record<string, string | string[]> | null): string | undefined {
  const raw = params?.id;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0];
  return undefined;
}

export default function OutletPage() {
  const params = useParams();
  const id = paramId(params);
  const { addItem, items: cartItems, updateQuantity } = useCart();
  
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchOutletData = useCallback(async () => {
    if (!id) return;
    setFetchError(null);
    setIsLoading(true);
    try {
      const [outletRes, menuRes] = await Promise.all([
        fetch(`${PUBLIC_API_URL}/api/outlets/${id}`),
        fetch(`${PUBLIC_API_URL}/api/outlets/${id}/menu`),
      ]);
      const outletData = await outletRes.json().catch(() => null);
      const menuData = await menuRes.json().catch(() => null);
      if (!outletRes.ok) {
        throw new Error(
          (outletData && typeof outletData === "object" && "error" in outletData
            ? String((outletData as { error?: string }).error)
            : null) || "Could not load outlet"
        );
      }
      if (!menuRes.ok) {
        throw new Error("Could not load menu");
      }
      setOutlet(outletData);
      setMenuItems(Array.isArray(menuData) ? menuData : []);
    } catch (e) {
      setOutlet(null);
      setMenuItems([]);
      setFetchError(e instanceof Error ? e.message : "Could not load outlet");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchOutletData();
  }, [id, fetchOutletData]);

  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = selectedCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-3xl mb-8" />
        <div className="h-8 bg-gray-200 w-1/3 rounded mb-4" />
        <div className="h-4 bg-gray-200 w-1/2 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && fetchError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <p className="text-red-700 mb-4">{fetchError}</p>
        <button
          type="button"
          onClick={() => fetchOutletData()}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
        >
          <RefreshCw size={18} />
          Retry
        </button>
      </div>
    );
  }

  if (!outlet) return <div className="container mx-auto px-4 py-16 text-center">Outlet not found</div>;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="relative h-64 md:h-80 w-full bg-gray-200">
        {outlet.image && outlet.image.startsWith("http") ? (
          <RemoteFillImage
            src={outlet.image}
            alt={outlet.name}
            priority
          />
        ) : (
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
            alt={outlet.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <Link 
          href="/" 
          className="absolute top-6 left-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40 transition-all"
        >
          <ChevronLeft size={24} />
        </Link>
        
        <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/80 to-transparent">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-black mb-2">{outlet.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-200">
              <div className="flex items-center gap-1.5 bg-green-600 text-white px-2 py-0.5 rounded-lg">
                <Star size={14} fill="currentColor" />
                <span>{outlet.rating}</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/30 pl-4">
                <Clock size={16} />
                <span>{outlet.prepTime} mins</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/30 pl-4">
                <MapPin size={16} />
                <span>{outlet.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Menu Content */}
          <div className="flex-1">
            {/* Info Banner */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-8 flex items-start gap-3">
              <Info className="text-orange-500 shrink-0" size={20} />
              <p className="text-sm text-orange-800">
                {outlet.description}. Preparation starts according to your selected pickup time to ensure freshness.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                    selectedCategory === category
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map(item => {
                const cartItem = cartItems.find(i => i._id === item._id);
                return (
                  <div 
                    key={item._id} 
                    className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      {item.image && item.image.startsWith("http") ? (
                        <RemoteFillImage src={item.image} alt={item.name} />
                      ) : (
                        <Image
                          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {item.isVeg ? (
                          <div className="border border-green-500 p-0.5 rounded-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          </div>
                        ) : (
                          <div className="border border-red-500 p-0.5 rounded-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                      <p className="text-gray-500 text-xs line-clamp-2 mb-2 leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-bold text-gray-900">
                          {formatCurrency(item.price)}
                        </span>
                        
                        {cartItem ? (
                          <div className="flex items-center gap-3 bg-orange-50 text-orange-600 rounded-lg px-2 py-1 border border-orange-200">
                            <button 
                              onClick={() => updateQuantity(item._id, cartItem.quantity - 1)}
                              className="p-0.5 hover:bg-orange-100 rounded transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-sm font-bold min-w-[1ch] text-center">
                              {cartItem.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item._id, cartItem.quantity + 1)}
                              className="p-0.5 hover:bg-orange-100 rounded transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addItem(item)}
                            className="bg-white text-orange-500 border border-orange-200 hover:bg-orange-50 px-4 py-1 rounded-lg text-sm font-bold transition-colors"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Preview / Sticky Section */}
          <div className="lg:w-80 hidden lg:block">
            <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShoppingCart size={20} className="text-orange-500" />
                Your Cart
              </h2>
              
              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                    {cartItems.map(item => (
                      <div key={item._id} className="flex justify-between items-center text-sm">
                        <div className="flex-1 truncate pr-2">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <div className="text-gray-500 text-xs">{formatCurrency(item.price)} x {item.quantity}</div>
                        </div>
                        <span className="font-bold text-gray-900 whitespace-nowrap">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0))}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0))}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/cart"
                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-2xl font-bold transition-colors shadow-lg shadow-orange-200"
                  >
                    Go to Checkout
                  </Link>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Your cart is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Cart Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-0 w-full px-4 lg:hidden z-40">
          <Link 
            href="/cart"
            className="flex items-center justify-between w-full bg-orange-500 text-white p-4 rounded-2xl font-bold shadow-xl shadow-orange-200 animate-in slide-in-from-bottom-10"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <div>
                <div>{cartItems.length} items</div>
                <div className="text-xs text-orange-100">From {outlet.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span>View Cart</span>
              <ChevronLeft size={20} className="rotate-180" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
