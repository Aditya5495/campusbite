"use client";

import React from "react";
import { AuthProvider } from "@/store/AuthContext";
import { CartProvider } from "@/store/CartContext";
import Navbar from "@/components/layout/Navbar";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t bg-white py-8">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} CampusBite. Bennett University.
              </p>
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
