'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Search,
} from 'lucide-react';
import type { Category, Profile } from '@/types/database';

const steps = [
  { id: 1, title: 'Service Type', icon: Search },
  { id: 2, title: 'Details', icon: FileText },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Budget & Schedule', icon: Calendar },
];

interface ServiceRequestFormProps {
  userId: string;
  userProfile: Profile | null;
  categories: Category[];
}

export function ServiceRequestForm({
  userId,
  userProfile,
  categories,
}: ServiceRequestFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    preferred_date: '',
    budget_min: '',
    budget_max: '',
    urgency: 'flexible',
  });

  function canProceed(): boolean {
    switch (currentStep) {
      case 1:
        return formData.category_id !== '';
      case 2:
        return formData.title.trim().length > 0 && formData.description.trim().length > 0;
      case 3:
        return formData.city.trim().length > 0 && formData.state.trim().length > 0 && formData.zip_code.trim().length > 0;
      case 4:
        return true; // Budget and schedule are optional
      default:
        return false;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    const { data: request, error: insertError } = await supabase
      .from('service_requests')
      .insert({
        customer_id: userId,
        category_id: formData.category_id,
        title: formData.title,
        description: formData.description,
        address: formData.address || null,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        preferred_date: formData.preferred_date || null,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        status: 'open',
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    // Redirect to success page or request details
    router.push(`/request/${request.id}/success`);
  }

  const selectedCategory = categories.find(c => c.id === formData.category_id);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header initialUser={userProfile} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-red-600 text-white'
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
                    className={`w-12 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-red-600' : 'bg-neutral-800'
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
              {currentStep === 1 && 'What service do you need?'}
              {currentStep === 2 && 'Tell us about your project'}
              {currentStep === 3 && 'Where do you need service?'}
              {currentStep === 4 && 'Budget & Schedule'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Select a category that best matches your needs'}
              {currentStep === 2 && 'Provide details to help professionals understand your project'}
              {currentStep === 3 && 'Enter your service location'}
              {currentStep === 4 && 'Optional: Set your budget range and preferred timing'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30">
                {error}
              </div>
            )}

            {/* Step 1: Category Selection */}
            {currentStep === 1 && (
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category_id: category.id })}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      formData.category_id === category.id
                        ? 'border-red-500 bg-red-500/20 text-red-400'
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
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {selectedCategory && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400">
                      Selected: <span className="font-medium">{selectedCategory.name}</span>
                    </p>
                  </div>
                )}
                <Input
                  label="Project Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Fix leaky faucet in master bathroom"
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Describe your project in detail. Include:
• What needs to be done
• Current condition or issues
• Any specific requirements
• Materials you have (if any)"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
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
                  label="ZIP Code *"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  placeholder="12345"
                />
                <p className="text-xs text-neutral-500">
                  Your full address will only be shared with professionals you choose to connect with.
                </p>
              </div>
            )}

            {/* Step 4: Budget & Schedule */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Budget Range (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="number"
                        value={formData.budget_min}
                        onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                        placeholder="Min"
                        min="0"
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="number"
                        value={formData.budget_max}
                        onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                        placeholder="Max"
                        min="0"
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                <Input
                  label="Preferred Date (optional)"
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    How urgent is this project?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'emergency', label: 'Emergency', desc: 'Need help today' },
                      { value: 'soon', label: 'Soon', desc: 'Within a week' },
                      { value: 'flexible', label: 'Flexible', desc: 'No rush' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgency: option.value })}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          formData.urgency === option.value
                            ? 'border-red-500 bg-red-500/20 text-red-400'
                            : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-neutral-500 mt-1">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
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
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  >
                    Cancel
                  </Button>
                </Link>
              )}

              {currentStep < steps.length ? (
                <Button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <p className="text-neutral-400 text-sm">
            After submitting, local professionals will be notified and can send you quotes.
            You&apos;ll receive their contact information to compare and choose.
          </p>
        </div>
      </main>
    </div>
  );
}
