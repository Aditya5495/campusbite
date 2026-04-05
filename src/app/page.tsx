"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Utensils, Search, Zap, CalendarDays, ArrowRight, Clock, Star, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OutletCard from "@/components/student/OutletCard";
import { Outlet } from "@/types";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { PUBLIC_API_URL } from "@/lib/public-api-url";

export default function Home() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOutlets = useCallback(async () => {
    setFetchError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${PUBLIC_API_URL}/api/outlets`);
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          (data && typeof data === "object" && "error" in data && String((data as { error?: string }).error)) ||
            "Could not load outlets"
        );
      }
      setOutlets(Array.isArray(data) ? data : []);
    } catch (e) {
      setOutlets([]);
      setFetchError(e instanceof Error ? e.message : "Could not load outlets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outlet.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      className="container mx-auto px-4 py-8"
    >
      {/* Hero Section */}
      <motion.section 
        variants={fadeIn}
        className="mb-12 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-orange-200"
      >
        <div className="relative z-10 md:w-2/3">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black mb-6 leading-tight"
          >
            Hungry? <br />Skip the line, <br />pre-order now!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-orange-50 text-lg md:text-xl mb-8 font-medium"
          >
            Order your favorite meals from Bennett University's top outlets and pick up when it's ready.
          </motion.p>
          
          <div className="flex flex-wrap gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/30 cursor-default"
            >
              <Zap size={24} className="text-yellow-300" />
              <div>
                <div className="font-bold">Instant Order</div>
                <div className="text-xs text-orange-100">Ready in minutes</div>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/30 cursor-default"
            >
              <CalendarDays size={24} className="text-blue-200" />
              <div>
                <div className="font-bold">Schedule Pickup</div>
                <div className="text-xs text-orange-100">Pick your own time</div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{ opacity: 0.1, scale: 1, rotate: 12 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute right-[-50px] bottom-[-50px] hidden lg:block"
        >
          <Utensils size={400} />
        </motion.div>
      </motion.section>

      {/* Search & Filter */}
      <motion.div variants={fadeIn} className="mb-12">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for outlets or food items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none transition-all text-lg shadow-sm"
          />
        </div>
      </motion.div>

      {/* Outlets Grid */}
      <section>
        <motion.div 
          variants={fadeIn}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900">Popular Outlets</h2>
          <Link href="/outlets" className="text-orange-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            See All <ArrowRight size={18} />
          </Link>
        </motion.div>

        {fetchError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-wrap items-center justify-between gap-3">
            <span>{fetchError}</span>
            <button
              type="button"
              onClick={() => fetchOutlets()}
              className="inline-flex items-center gap-2 font-semibold underline hover:no-underline"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-64" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredOutlets.map((outlet) => (
                <motion.div
                  key={outlet._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <OutletCard outlet={outlet} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Features Section */}
      <motion.section 
        variants={fadeIn}
        viewport={{ once: true }}
        className="mt-20 py-16 border-t"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why choose CampusBite?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            We make campus dining effortless, so you can focus on what matters most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div whileHover={{ y: -5 }} className="text-center">
            <div className="h-16 w-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">No More Queues</h3>
            <p className="text-gray-500">Save 15-20 minutes every meal by pre-ordering through the app.</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="text-center">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Utensils size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Fresh Food</h3>
            <p className="text-gray-500">Food preparation starts just before your arrival to ensure maximum freshness.</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="text-center">
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CalendarDays size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Plan Ahead</h3>
            <p className="text-gray-500">Schedule your meals for the whole day or week in advance.</p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
