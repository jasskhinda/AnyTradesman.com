'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  MapPin,
  Wrench,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import type { Category } from '@/types/database';

const steps = [
  { id: 1, title: 'Business Details', icon: Building2 },
  { id: 2, title: 'Location & Coverage', icon: MapPin },
  { id: 3, title: 'Services', icon: Wrench },
];

export default function BusinessSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
    selectedCategories: [] as string[],
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  async function checkAuthAndLoadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    setUserId(user.id);

    // Check if user already has a business
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (existingBusiness) {
      router.push('/business');
      return;
    }

    // Load categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (categoriesData) {
      setCategories(categoriesData);
    }

    // Pre-fill email from user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profile) {
      setFormData(prev => ({ ...prev, email: profile.email }));
    }

    setLoading(false);
  }

  function toggleCategory(categoryId: string) {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.city.trim().length > 0 && formData.state.trim().length > 0;
      case 3:
        return formData.selectedCategories.length > 0;
      default:
        return false;
    }
  }

  async function handleSubmit() {
    if (!userId) return;

    setSaving(true);
    setError(null);

    const supabase = createClient();

    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        owner_id: userId,
        name: formData.name,
        slug,
        description: formData.description || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        service_radius_miles: formData.service_radius_miles,
        is_verified: false,
        verification_status: 'pending',
        is_active: true,
      })
      .select()
      .single();

    if (businessError) {
      setError(businessError.message);
      setSaving(false);
      return;
    }

    // Add categories
    if (formData.selectedCategories.length > 0) {
      await supabase
        .from('business_categories')
        .insert(formData.selectedCategories.map(catId => ({
          business_id: business.id,
          category_id: catId,
        })));
    }

    // Redirect to credentials page
    router.push('/business/credentials');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/2 mx-auto" />
            <div className="h-64 bg-neutral-800 rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-neutral-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-neutral-400 mt-4">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">
              {currentStep === 1 && 'Business Details'}
              {currentStep === 2 && 'Location & Service Area'}
              {currentStep === 3 && 'Service Categories'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Tell us about your business'}
              {currentStep === 2 && 'Where do you provide services?'}
              {currentStep === 3 && 'What services do you offer?'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30">
                {error}
              </div>
            )}

            {/* Step 1: Business Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <Input
                  label="Business Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Business Name"
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell customers about your business, experience, and what makes you stand out..."
                  />
                </div>
                <Input
                  label="Business Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
                <Input
                  label="Business Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@yourbusiness.com"
                />
                <Input
                  label="Website (optional)"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.yourbusiness.com"
                />
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Input
                  label="Street Address (optional)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                  <Input
                    label="State *"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                  />
                </div>
                <Input
                  label="ZIP Code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  placeholder="12345"
                />
                <div>
                  <Input
                    label="Service Radius (miles)"
                    type="number"
                    value={formData.service_radius_miles}
                    onChange={(e) => setFormData({ ...formData, service_radius_miles: parseInt(e.target.value) || 25 })}
                    min={1}
                    max={500}
                  />
                  <p className="mt-1 text-sm text-neutral-500">
                    You&apos;ll receive leads from customers within this distance. You can change this later.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Categories */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-neutral-400 text-sm">
                  Select all service categories that apply to your business. This helps customers find you.
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                        formData.selectedCategories.includes(category.id)
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      {category.description && (
                        <p className="text-xs mt-1 text-neutral-500">{category.description}</p>
                      )}
                    </button>
                  ))}
                </div>
                {formData.selectedCategories.length > 0 && (
                  <p className="text-sm text-neutral-400">
                    Selected: {formData.selectedCategories.length} {formData.selectedCategories.length === 1 ? 'category' : 'categories'}
                  </p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-neutral-800">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < steps.length ? (
                <Button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={saving || !canProceed()}>
                  {saving ? 'Creating...' : 'Create Business'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
