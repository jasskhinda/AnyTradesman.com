'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { User, Bell, Shield, Trash2, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
}

interface SettingsFormProps {
  initialProfile: Profile;
}

export function SettingsForm({ initialProfile }: SettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: initialProfile.full_name || '',
    email: initialProfile.email || '',
    phone: initialProfile.phone || '',
  });
  const [notifications, setNotifications] = useState({
    email_leads: true,
    email_messages: true,
    email_marketing: false,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq('id', initialProfile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <Card className="bg-neutral-900 border-neutral-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Profile Information</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Full Name
            </label>
            <Input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={profile.email}
              disabled
              className="bg-neutral-800 border-neutral-700 opacity-50"
            />
            <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Phone Number
            </label>
            <Input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-neutral-900 border-neutral-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">New Lead Notifications</p>
              <p className="text-sm text-neutral-400">Get notified when you receive new leads</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email_leads}
              onChange={(e) => setNotifications({ ...notifications, email_leads: e.target.checked })}
              className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-red-500 focus:ring-red-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Message Notifications</p>
              <p className="text-sm text-neutral-400">Get notified when you receive messages</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email_messages}
              onChange={(e) => setNotifications({ ...notifications, email_messages: e.target.checked })}
              className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-red-500 focus:ring-red-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Marketing Emails</p>
              <p className="text-sm text-neutral-400">Receive tips, updates, and promotions</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email_marketing}
              onChange={(e) => setNotifications({ ...notifications, email_marketing: e.target.checked })}
              className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-red-500 focus:ring-red-500"
            />
          </label>
        </div>
      </Card>

      {/* Security */}
      <Card className="bg-neutral-900 border-neutral-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Security</h2>
        </div>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => router.push('/forgot-password')}>
            Change Password
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-neutral-900 border-red-900/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
        </div>
        <p className="text-neutral-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button variant="danger">
            Delete Account
          </Button>
        </div>
      </Card>
    </main>
  );
}
