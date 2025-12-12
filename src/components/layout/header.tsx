'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, LayoutDashboard, Building2 } from 'lucide-react';
import type { Profile } from '@/types/database';

export function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser(profile);
      }
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-neutral-900 border-b border-neutral-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Image
                src="/Logo - FINAL PNG.png"
                alt="AnyTradesman"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-blue-500">AnyTradesman</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/search" className="text-neutral-300 hover:text-white font-medium">
              Find a Pro
            </Link>
            <Link href="/categories" className="text-neutral-300 hover:text-white font-medium">
              Services
            </Link>
            <Link href="/how-it-works" className="text-neutral-300 hover:text-white font-medium">
              How It Works
            </Link>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-neutral-700 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-neutral-300 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 py-1 z-20">
                      <div className="px-4 py-2 border-b border-neutral-700">
                        <p className="text-sm font-medium text-white truncate">
                          {user.full_name || 'User'}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      {user.role === 'business_owner' && (
                        <Link
                          href="/business"
                          className="flex items-center px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          My Business
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-neutral-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-neutral-300 hover:text-white hover:bg-neutral-800">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              href="/search"
              className="block px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Find a Pro
            </Link>
            <Link
              href="/categories"
              className="block px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/how-it-works"
              className="block px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-neutral-800 rounded-lg"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="pt-4 space-y-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-800">Sign in</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
