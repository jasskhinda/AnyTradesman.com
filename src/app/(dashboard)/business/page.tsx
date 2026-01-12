'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Settings,
  Save,
} from 'lucide-react';
import type { Business, Category } from '@/types/database';

export default function BusinessPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [businessCategories, setBusinessCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    service_radius_miles: 25,
  });

  useEffect(() => {
    fetchBusinessData();
  }, []);

  async function fetchBusinessData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user has business owner role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'business_owner') {
      router.push('/dashboard');
      return;
    }

    // Fetch business
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (businessData) {
      setBusiness(businessData);
      setFormData({
        name: businessData.name || '',
        description: businessData.description || '',
        phone: businessData.phone || '',
        email: businessData.email || '',
        website: businessData.website || '',
        address: businessData.address || '',
        city: businessData.city || '',
        state: businessData.state || '',
        zip_code: businessData.zip_code || '',
        service_radius_miles: businessData.service_radius_miles || 25,
      });

      // Fetch business categories
      const { data: bizCats } = await supabase
        .from('business_categories')
        .select('category_id')
        .eq('business_id', businessData.id);

      if (bizCats) {
        setBusinessCategories(bizCats.map((bc: { category_id: string }) => bc.category_id));
      }
    }

    if (categoriesData) {
      setCategories(categoriesData);
    }

    setLoading(false);
  }

  async function handleSave() {
    if (!business) return;

    setSaving(true);
    const supabase = createClient();

    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { error } = await supabase
      .from('businesses')
      .update({
        ...formData,
        slug,
        updated_at: new Date().toISOString(),
      })
      .eq('id', business.id);

    if (!error) {
      // Update categories
      await supabase
        .from('business_categories')
        .delete()
        .eq('business_id', business.id);

      if (businessCategories.length > 0) {
        await supabase
          .from('business_categories')
          .insert(businessCategories.map(catId => ({
            business_id: business.id,
            category_id: catId,
          })));
      }

      fetchBusinessData();
    }

    setSaving(false);
  }

  function toggleCategory(categoryId: string) {
    setBusinessCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/3" />
            <div className="h-64 bg-neutral-800 rounded" />
          </div>
        </main>
      </div>
    );
  }

  // No business yet - redirect to setup
  if (!business) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Set Up Your Business Profile</h1>
          <p className="text-neutral-400 mb-8">
            Complete your business profile to start receiving leads from customers in your area.
          </p>
          <Link href="/business/setup">
            <Button size="lg">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Business</h1>
            <p className="mt-1 text-neutral-400">Manage your business profile and settings</p>
          </div>
          <div className="flex items-center gap-3">
            {business.is_verified ? (
              <span className="flex items-center text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified
              </span>
            ) : (
              <span className="flex items-center text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Pending Verification
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link href="/business/credentials">
            <Card className="hover:border-neutral-700 transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-500/20">
                    <FileCheck className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-neutral-400">Credentials</p>
                    <p className="font-semibold text-white">Manage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/business/subscription">
            <Card className="hover:border-neutral-700 transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Settings className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-neutral-400">Subscription</p>
                    <p className="font-semibold text-white">View Plans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/business/${business.slug}`}>
            <Card className="hover:border-neutral-700 transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <Globe className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-neutral-400">Public Profile</p>
                    <p className="font-semibold text-white">View</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Business Details Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Business Information</CardTitle>
            <CardDescription>Update your business details and service area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Business Name"
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="business@example.com"
              />
              <Input
                label="Website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Tell customers about your business, services, and experience..."
              />
            </div>

            {/* Address */}
            <div className="pt-4 border-t border-neutral-800">
              <h3 className="text-white font-medium mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Service Location
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                  />
                  <Input
                    label="ZIP Code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="12345"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Input
                  label="Service Radius (miles)"
                  type="number"
                  value={formData.service_radius_miles}
                  onChange={(e) => setFormData({ ...formData, service_radius_miles: parseInt(e.target.value) || 25 })}
                  min={1}
                  max={500}
                />
                <p className="mt-1 text-sm text-neutral-500">
                  You&apos;ll receive leads from customers within this distance of your location.
                </p>
              </div>
            </div>

            {/* Categories */}
            <div className="pt-4 border-t border-neutral-800">
              <h3 className="text-white font-medium mb-4">Service Categories</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Select all categories that apply to your business.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                      businessCategories.includes(category.id)
                        ? 'border-red-500 bg-red-500/20 text-red-400'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
