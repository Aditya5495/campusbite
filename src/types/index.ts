export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'outlet_admin' | 'super_admin';
  phone?: string;
  avatar?: string;
  isVerified: boolean;
}

export interface Outlet {
  _id: string;
  name: string;
  description: string;
  image: string;
  address: string;
  phone: string;
  email: string;
  prepTime: number;
  rating: number;
  isOpen: boolean;
  operatingHours: {
    opening: string;
    closing: string;
  };
  menuCategories: string[];
}

export interface MenuItem {
  _id: string;
  outletId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  prepTime: number;
  isAvailable: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  studentId: string;
  outletId: string | { _id: string; name?: string; image?: string };
  items: OrderItem[];
  orderType: 'instant' | 'scheduled';
  scheduledPickupTime?: string;
  totalAmount: number;
  status: 'placed' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  placedAt: string;
  estimatedPrepTime?: number;
}
