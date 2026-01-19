'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Search, X, Check } from 'lucide-react';

// Service categories for the dropdown
const SERVICES = [
  'Acoustic Ceiling',
  'Additions and Remodels',
  'Air Duct Cleaning',
  'Appliance Repair',
  'Appraiser',
  'Architects, Designers & Engineers',
  'Asbestos Removal',
  'Asphalt & Paving',
  'Audio/Visual',
  'Awnings & Canopies',
  'Basement Waterproofing',
  'Bathroom Remodeling',
  'Cabinet Making',
  'Carpentry',
  'Carpet Cleaning',
  'Chimney Sweep & Repair',
  'Cleaning Services',
  'Concrete & Masonry',
  'Decks & Porches',
  'Demolition',
  'Drywall',
  'Electrical',
  'Excavation',
  'Fencing',
  'Flooring',
  'Foundation Repair',
  'Garage Door',
  'General Contractor',
  'Glass & Mirrors',
  'Gutters',
  'Handyman',
  'Hauling & Junk Removal',
  'HVAC',
  'Home Inspection',
  'Home Security',
  'House Cleaning',
  'Insulation',
  'Interior Design',
  'Kitchen Remodeling',
  'Landscaping',
  'Lawn Care',
  'Locksmith',
  'Moving & Storage',
  'Painting',
  'Pest Control',
  'Plumbing',
  'Pool & Spa',
  'Pressure Washing',
  'Roofing & Gutters',
  'Siding',
  'Solar',
  'Stucco & Plastering',
  'Tile & Stone',
  'Tree Service',
  'Water Damage Restoration',
  'Window Installation',
  'Window Treatment',
];

type Step = 1 | 2 | 3 | 4;

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [service, setService] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Service dropdown state
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const serviceInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter services based on search
  const filteredServices = SERVICES.filter(s =>
    s.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format phone number
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  // Validation for each step
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return service.trim().length > 0 && zipCode.trim().length >= 5;
      case 2:
        return firstName.trim().length > 0 && lastName.trim().length > 0;
      case 3:
        return businessName.trim().length > 0 && phone.replace(/\D/g, '').length === 10;
      case 4:
        return email.trim().length > 0 && password.length >= 8 && password === confirmPassword;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            role: 'business_owner',
            // Store onboarding data
            onboarding_service: service,
            onboarding_zip: zipCode,
            onboarding_business_name: businessName,
            onboarding_phone: phone,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/business/setup`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else {
          setError(signUpError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists. Try signing in instead.');
        setIsLoading(false);
        return;
      }

      // Redirect to success page
      router.push('/register/business/success?email=' + encodeURIComponent(email));
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectService = (serviceName: string) => {
    setService(serviceName);
    setServiceSearch('');
    setShowServiceDropdown(false);
  };

  const clearService = () => {
    setService('');
    setServiceSearch('');
    serviceInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-red-600">
            AnyTrades
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Back Arrow */}
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="mb-6 p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        {currentStep === 1 && (
          <button
            onClick={() => router.push('/register')}
            className="mb-6 p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step
                )}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-teal-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentStep === 1 && 'Get started with the basics'}
          {currentStep === 2 && 'Get started with the basics'}
          {currentStep === 3 && 'Get started with the basics'}
          {currentStep === 4 && 'Create your account'}
        </h1>
        <p className="text-gray-600 mb-8">
          {currentStep === 1 && 'Thousands of opportunities on AnyTrades; get started to start receiving leads.'}
          {currentStep === 2 && 'Thousands of opportunities on AnyTrades; get started to start receiving leads.'}
          {currentStep === 3 && 'Thousands of opportunities on AnyTrades; get started to start receiving leads.'}
          {currentStep === 4 && 'Set up your login credentials to access your account.'}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Service & ZIP */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Service Dropdown */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Service
              </label>
              {service ? (
                <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-white">
                  <span className="text-gray-900">{service}</span>
                  <button
                    onClick={clearService}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      ref={serviceInputRef}
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => {
                        setServiceSearch(e.target.value);
                        setShowServiceDropdown(true);
                      }}
                      onFocus={() => setShowServiceDropdown(true)}
                      placeholder="Search for a service..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {showServiceDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                        Services
                      </div>
                      {filteredServices.length > 0 ? (
                        filteredServices.map((s) => (
                          <button
                            key={s}
                            onClick={() => selectService(s)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                          >
                            <Search className="w-4 h-4 text-gray-400" />
                            {s}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500">No services found</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                ZIP code
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Enter your ZIP code"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 2: Name */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                autoComplete="given-name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                autoComplete="family-name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500">
              Use the business owner&apos;s name
            </p>
          </div>
        )}

        {/* Step 3: Business Info */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Business name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
                autoComplete="organization"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                If you don&apos;t have one, you can use your name
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Mobile number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="xxx-xxx-xxxx"
                autoComplete="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                We&apos;ll use this number to put you in touch with homeowners
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Account Creation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Next Button */}
        <div className="mt-8">
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`w-full py-4 rounded-lg text-lg font-medium transition-colors ${
                canProceed()
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              className={`w-full py-4 rounded-lg text-lg font-medium transition-colors ${
                canProceed() && !isLoading
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          )}
        </div>

        {/* Terms Text (Step 3 & 4) */}
        {(currentStep === 3 || currentStep === 4) && (
          <p className="mt-4 text-xs text-gray-500 text-center">
            By clicking {currentStep === 4 ? 'Create Account' : 'Next'}, I agree to the{' '}
            <Link href="/terms" className="text-teal-600 hover:underline">
              AnyTrades Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-teal-600 hover:underline">
              Privacy Policy
            </Link>{' '}
            and authorize AnyTrades and parties acting on its behalf, to use automated technology
            to deliver marketing calls and texts to the number I provided. Consent is not a condition of purchase.
          </p>
        )}

        {/* Questions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Questions?{' '}
            <a href="tel:+18337770260" className="text-teal-600 hover:underline">
              (833) 777-0260
            </a>
          </p>
        </div>

        {/* Already have account */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
