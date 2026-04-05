'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useAdminOutlet } from '@/store/AdminOutletContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Store, Clock, Phone, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import { PUBLIC_API_URL } from '@/lib/public-api-url';

interface Outlet {
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

export default function StoreSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    scopeReady,
    loadingOutlets,
    outletsError,
    adminHeaders,
    selectedOutletId,
  } = useAdminOutlet();
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    address: '',
    phone: '',
    email: '',
    prepTime: '',
    isOpen: true,
    operatingHours: {
      opening: '',
      closing: ''
    }
  });

  const fetchOutletData = useCallback(async () => {
    setFetchError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${PUBLIC_API_URL}/api/admin/outlet`, {
        headers: adminHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to load outlet');
      }
      setOutlet(data.outlet);
      setFormData({
        name: data.outlet.name,
        description: data.outlet.description,
        image: data.outlet.image,
        address: data.outlet.address,
        phone: data.outlet.phone,
        email: data.outlet.email,
        prepTime: data.outlet.prepTime.toString(),
        isOpen: data.outlet.isOpen,
        operatingHours: {
          opening: data.outlet.operatingHours.opening,
          closing: data.outlet.operatingHours.closing,
        },
      });
    } catch (error) {
      setOutlet(null);
      setFetchError(error instanceof Error ? error.message : 'Failed to load outlet');
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
    fetchOutletData();
  }, [
    authLoading,
    user,
    router,
    scopeReady,
    loadingOutlets,
    outletsError,
    selectedOutletId,
    fetchOutletData,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        prepTime: parseInt(formData.prepTime)
      };

      const response = await fetch(`${PUBLIC_API_URL}/api/admin/outlet`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setOutlet(data.outlet);
        alert('Store settings updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update store settings:', error);
      alert('Failed to update store settings');
    } finally {
      setIsSaving(false);
    }
  };

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
          Select an outlet above to edit store settings.
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
              onClick={() => fetchOutletData()}
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
              <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Preview */}
          {outlet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Store Preview</h3>
              <div className="flex items-start space-x-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <Image
                    src={outlet.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200'}
                    alt={outlet.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{outlet.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{outlet.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {outlet.prepTime} min
                    </span>
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {outlet.phone}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      outlet.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {outlet.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Prep Time (minutes)</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="60"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({...formData, prepTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://example.com/store-image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({...formData, isOpen: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Store is currently open</span>
              </label>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    pattern="[6-9]\d{9}"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>

          {/* Operating Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Operating Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                <input
                  type="time"
                  required
                  value={formData.operatingHours.opening}
                  onChange={(e) => setFormData({
                    ...formData, 
                    operatingHours: {...formData.operatingHours, opening: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                <input
                  type="time"
                  required
                  value={formData.operatingHours.closing}
                  onChange={(e) => setFormData({
                    ...formData, 
                    operatingHours: {...formData.operatingHours, closing: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
