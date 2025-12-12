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
  FileCheck,
  Plus,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Shield,
} from 'lucide-react';
import type { BusinessCredential, Business } from '@/types/database';

const credentialTypes = [
  { value: 'license', label: 'Business License' },
  { value: 'insurance', label: 'Insurance Certificate' },
  { value: 'bond', label: 'Bonding Certificate' },
  { value: 'certification', label: 'Professional Certification' },
  { value: 'permit', label: 'Trade Permit' },
  { value: 'other', label: 'Other Document' },
];

export default function CredentialsPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [credentials, setCredentials] = useState<BusinessCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCredential, setNewCredential] = useState({
    credential_type: 'license',
    credential_number: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch business
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!businessData) {
      router.push('/business/setup');
      return;
    }

    setBusiness(businessData);

    // Fetch credentials
    const { data: credentialsData } = await supabase
      .from('business_credentials')
      .select('*')
      .eq('business_id', businessData.id)
      .order('created_at', { ascending: false });

    if (credentialsData) {
      setCredentials(credentialsData);
    }

    setLoading(false);
  }

  async function handleAddCredential() {
    if (!business) return;

    setSaving(true);
    setError(null);

    const supabase = createClient();

    const { error: insertError } = await supabase
      .from('business_credentials')
      .insert({
        business_id: business.id,
        credential_type: newCredential.credential_type,
        credential_number: newCredential.credential_number || null,
        issuing_authority: newCredential.issuing_authority || null,
        issue_date: newCredential.issue_date || null,
        expiry_date: newCredential.expiry_date || null,
        verification_status: 'pending',
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    // Reset form and refresh
    setNewCredential({
      credential_type: 'license',
      credential_number: '',
      issuing_authority: '',
      issue_date: '',
      expiry_date: '',
    });
    setShowAddForm(false);
    setSaving(false);
    fetchData();
  }

  async function handleDeleteCredential(credentialId: string) {
    if (!confirm('Are you sure you want to delete this credential?')) return;

    const supabase = createClient();
    await supabase
      .from('business_credentials')
      .delete()
      .eq('id', credentialId);

    fetchData();
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/3" />
            <div className="h-64 bg-neutral-800 rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/business">
              <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Business Credentials</h1>
              <p className="mt-1 text-neutral-400">Upload licenses, insurance, and certifications</p>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Credential
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-400">Why add credentials?</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Verified businesses receive a badge on their profile and appear higher in search results.
                  Customers trust verified professionals more, leading to more leads and jobs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Credential Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-white">Add New Credential</CardTitle>
              <CardDescription>Enter the details of your credential or certification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Credential Type *
                </label>
                <select
                  value={newCredential.credential_type}
                  onChange={(e) => setNewCredential({ ...newCredential, credential_type: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {credentialTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="License/Certificate Number"
                value={newCredential.credential_number}
                onChange={(e) => setNewCredential({ ...newCredential, credential_number: e.target.value })}
                placeholder="e.g., #123456"
              />

              <Input
                label="Issuing Authority"
                value={newCredential.issuing_authority}
                onChange={(e) => setNewCredential({ ...newCredential, issuing_authority: e.target.value })}
                placeholder="e.g., California Contractors State License Board"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Issue Date"
                  type="date"
                  value={newCredential.issue_date}
                  onChange={(e) => setNewCredential({ ...newCredential, issue_date: e.target.value })}
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={newCredential.expiry_date}
                  onChange={(e) => setNewCredential({ ...newCredential, expiry_date: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddCredential} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Credential'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credentials List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Your Credentials ({credentials.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {credentials.length === 0 ? (
              <div className="text-center py-8">
                <FileCheck className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
                <p className="text-neutral-400">No credentials added yet</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Add your business licenses, insurance, and certifications to get verified.
                </p>
                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Credential
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <div
                    key={credential.id}
                    className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">
                            {credentialTypes.find(t => t.value === credential.credential_type)?.label || credential.credential_type}
                          </h3>
                          <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                            credential.verification_status === 'verified'
                              ? 'bg-green-500/20 text-green-400'
                              : credential.verification_status === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {getStatusIcon(credential.verification_status)}
                            {getStatusText(credential.verification_status)}
                          </span>
                        </div>
                        {credential.credential_number && (
                          <p className="text-sm text-neutral-400 mt-1">
                            Number: {credential.credential_number}
                          </p>
                        )}
                        {credential.issuing_authority && (
                          <p className="text-sm text-neutral-400">
                            Issued by: {credential.issuing_authority}
                          </p>
                        )}
                        {credential.expiry_date && (
                          <p className={`text-sm mt-1 ${
                            new Date(credential.expiry_date) < new Date()
                              ? 'text-red-400'
                              : 'text-neutral-500'
                          }`}>
                            {new Date(credential.expiry_date) < new Date() && (
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                            )}
                            Expires: {new Date(credential.expiry_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCredential(credential.id)}
                        className="border-neutral-700 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Continue to Dashboard */}
        {credentials.length > 0 && (
          <div className="mt-6 text-center">
            <Link href="/dashboard">
              <Button>
                Continue to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
