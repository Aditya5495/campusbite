"use client";

import React from "react";
import { useAuth } from "@/store/AuthContext";
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  ChevronRight,
  Settings,
  Bell,
  CreditCard,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to view your profile</h1>
        <a 
          href="/login"
          className="inline-block bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold"
        >
          Login
        </a>
      </div>
    );
  }

  const menuSections = [
    {
      title: "Account",
      items: [
        { icon: <Settings size={20} />, label: "Edit Profile", sublabel: "Name, email, phone" },
        { icon: <MapPin size={20} />, label: "My Addresses", sublabel: "Manage your delivery locations" },
        { icon: <CreditCard size={20} />, label: "Payments", sublabel: "Saved cards and UPI" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: <Bell size={20} />, label: "Notifications", sublabel: "Order updates and offers" },
        { icon: <ShieldCheck size={20} />, label: "Privacy & Security", sublabel: "Password and data settings" },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-8 text-center md:text-left md:flex md:items-center md:gap-8">
        <div className="h-24 w-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl flex items-center justify-center text-white text-4xl font-black mx-auto md:mx-0 shadow-lg shadow-orange-100">
          {user.name.charAt(0)}
        </div>
        <div className="mt-6 md:mt-0 flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-black text-gray-900">{user.name}</h1>
            {user.isVerified && (
              <div className="bg-blue-50 text-blue-600 p-0.5 rounded-full" title="Verified Bennett Student">
                <ShieldCheck size={16} fill="currentColor" fillOpacity={0.2} />
              </div>
            )}
          </div>
          <p className="text-gray-500 flex items-center justify-center md:justify-start gap-1.5 text-sm font-medium">
            <Mail size={14} /> {user.email}
          </p>
          {user.phone && (
            <p className="text-gray-500 flex items-center justify-center md:justify-start gap-1.5 text-sm font-medium mt-1">
              <Phone size={14} /> {user.phone}
            </p>
          )}
        </div>
        <div className="mt-6 md:mt-0">
          <span className="inline-block bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-100">
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-8">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">
              {section.title}
            </h2>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
              {section.items.map((item, itemIdx) => (
                <button 
                  key={itemIdx}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sublabel}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-200 group-hover:text-orange-300 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={logout}
          className="w-full mt-8 p-5 flex items-center gap-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-3xl transition-colors text-left group border border-red-100"
        >
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <LogOut size={20} />
          </div>
          <div>
            <p className="font-bold leading-tight">Logout</p>
            <p className="text-xs text-red-400 mt-0.5">Sign out of your account</p>
          </div>
        </button>
      </div>
    </div>
  );
}
