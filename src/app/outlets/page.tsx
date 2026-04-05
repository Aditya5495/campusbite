"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Search, ArrowLeft, Utensils, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OutletCard from "@/components/student/OutletCard";
import { Outlet } from "@/types";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { PUBLIC_API_URL } from "@/lib/public-api-url";

export default function OutletsPage() {
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
      <motion.div variants={fadeIn} className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">All Outlets</h1>
            <p className="text-gray-500">Explore all food outlets at Bennett University</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search outlets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-64" />
          ))}
        </div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredOutlets.length > 0 ? (
              filteredOutlets.map((outlet) => (
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
              ))
            ) : (
              <motion.div 
                key="no-results"
                variants={fadeIn}
                className="col-span-full text-center py-20"
              >
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils size={32} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No outlets found</h2>
                <p className="text-gray-500">Try searching with a different keyword.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
