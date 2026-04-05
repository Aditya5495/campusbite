'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useAdminOutlet } from '@/store/AdminOutletContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import RemoteFillImage from '@/components/common/RemoteFillImage';
import { PUBLIC_API_URL } from '@/lib/public-api-url';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  prepTime: number;
  isAvailable: boolean;
  ingredients: string[];
  allergens: string[];
}

export default function MenuManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    scopeReady,
    loadingOutlets,
    outletsError,
    adminHeaders,
    selectedOutletId,
  } = useAdminOutlet();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    isVeg: true,
    prepTime: '',
    isAvailable: true,
    ingredients: '',
    allergens: ''
  });

  const fetchMenuItems = useCallback(async () => {
    setFetchError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${PUBLIC_API_URL}/api/admin/menu-items`, {
        headers: adminHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to load menu');
      }
      setMenuItems(data.menuItems);
    } catch (error) {
      setMenuItems([]);
      setFetchError(error instanceof Error ? error.message : 'Failed to load menu');
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
    fetchMenuItems();
  }, [
    authLoading,
    user,
    router,
    scopeReady,
    loadingOutlets,
    outletsError,
    selectedOutletId,
    fetchMenuItems,
  ]);

  useEffect(() => {
    let filtered = menuItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (availabilityFilter) {
      const isAvailable = availabilityFilter === 'available';
      filtered = filtered.filter(item => item.isAvailable === isAvailable);
    }

    setFilteredItems(filtered);
  }, [menuItems, searchTerm, categoryFilter, availabilityFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      prepTime: parseInt(formData.prepTime),
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      allergens: formData.allergens.split(',').map(a => a.trim()).filter(Boolean),
    };

    try {
      const url = editingItem 
        ? `${PUBLIC_API_URL}/api/admin/menu-items/${editingItem._id}`
        : `${PUBLIC_API_URL}/api/admin/menu-items`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchMenuItems();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      isVeg: item.isVeg,
      prepTime: item.prepTime.toString(),
      isAvailable: item.isAvailable,
      ingredients: item.ingredients.join(', '),
      allergens: item.allergens.join(', ')
    });
    setShowAddForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`${PUBLIC_API_URL}/api/admin/menu-items/${itemId}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      isVeg: true,
      prepTime: '',
      isAvailable: true,
      ingredients: '',
      allergens: ''
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

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
          Select an outlet above to manage the menu.
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
              onClick={() => fetchMenuItems()}
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
              <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Add Item</span>
            </button>
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
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Items</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6 mb-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (minutes)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({...formData, prepTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                    placeholder="e.g., flour, sugar, eggs"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergens (comma separated)</label>
                  <input
                    type="text"
                    value={formData.allergens}
                    onChange={(e) => setFormData({...formData, allergens: e.target.value})}
                    placeholder="e.g., nuts, dairy, gluten"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({...formData, isVeg: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Vegetarian</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Available</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="relative h-48">
                <RemoteFillImage
                  src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'}
                  alt={item.name}
                />
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Unavailable</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{item.category}</span>
                  <span>{item.prepTime} min</span>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            {menuItems.length === 0 ? 'No menu items found. Add your first item!' : 'No items match your filters'}
          </div>
        )}
      </div>
    </div>
  );
}
