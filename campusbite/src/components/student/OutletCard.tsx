"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Star, MapPin } from "lucide-react";
import { Outlet } from "@/types";
import { cn } from "@/lib/utils";

interface OutletCardProps {
  outlet: Outlet;
}

export default function OutletCard({ outlet }: OutletCardProps) {
  return (
    <Link 
      href={`/outlet/${outlet._id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <Image
          src={outlet.image && outlet.image.startsWith('http') 
            ? outlet.image 
            : `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop`}
          alt={outlet.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!outlet.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white/90 text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
              Closed Now
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
            {outlet.name}
          </h3>
          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-sm font-bold">
            <Star size={14} fill="currentColor" />
            <span>{outlet.rating || "4.2"}</span>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm line-clamp-1 mb-4">
          {outlet.description}
        </p>
        
        <div className="flex items-center gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock size={16} className="text-orange-500" />
            <span>{outlet.prepTime} mins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="text-gray-400" />
            <span className="line-clamp-1">{outlet.address}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
