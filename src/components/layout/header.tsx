'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, LayoutDashboard, Building2 } from 'lucide-react';
import type { Profile } from '@/types/database';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

interface HeaderProps {
  initialUser?: Profile | null;
}

export function Header({ initialUser }: HeaderProps = {}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(initialUser === undefined);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;
    // If we have initialUser, we've already checked auth server-side
    let authChecked = initialUser !== undefined;

    // Helper to fetch profile with error handling
    const fetchProfile = async (userId: string): Promise<Profile | null> => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        return profile;
      } catch {
        return null;
      }
    };

    // Timeout to ensure loading state never gets stuck
    const timeout = setTimeout(() => {
      if (isMounted && !authChecked) {
        authChecked = true;
        setIsLoading(false);
      }
    }, 3000);

    // Only check auth client-side if we don't have initialUser
    const checkAuth = async () => {
      if (authChecked) return;

      try {
        // Try getSession first - reads from cookies/localStorage
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted || authChecked) return;

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (isMounted && !authChecked) {
            authChecked = true;
            setUser(profile);
            setIsLoading(false);
          }
          return;
        }

        // No session found
        if (isMounted && !authChecked) {
          authChecked = true;
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Header: Auth check error:', error);
        if (isMounted && !authChecked) {
          authChecked = true;
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth state changes (sign in/out during session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      // Skip INITIAL_SESSION if we already have server-provided user
      if (event === 'INITIAL_SESSION') {
        if (!authChecked && session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (isMounted && !authChecked) {
            authChecked = true;
            setUser(profile);
            setIsLoading(false);
          }
        } else if (!authChecked) {
          authChecked = true;
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Handle actual sign in/out events - always process these
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (isMounted) {
            setUser(profile);
          }
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [initialUser]);

  const handleSignOut = async () => {
    try {
      // Call server-side logout to properly clear cookies
      await fetch('/api/auth/logout', { method: 'POST' });

      // Also sign out on client side
      const supabase = createClient();
      await supabase.auth.signOut();

      // Clear user state immediately
      setUser(null);
      setIsProfileMenuOpen(false);

      // Navigate to home and refresh
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
      // Still try to redirect even if there's an error
      router.push('/');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/Logo - FINAL PNG.png"
                alt="AnyTradesman"
                width={56}
                height={56}
                className="h-14 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/search" className="text-neutral-700 hover:text-neutral-900 font-medium">
              Find a Pro
            </Link>
            <Link href="/categories" className="text-neutral-700 hover:text-neutral-900 font-medium">
              Services
            </Link>
            <Link href="/how-it-works" className="text-neutral-700 hover:text-neutral-900 font-medium">
              How It Works
            </Link>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-neutral-300 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-medium">
                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 py-1 z-50">
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
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200">Sign in</Button>
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
              className="text-neutral-700 hover:text-neutral-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 bg-white/90 rounded-lg mt-2">
            <Link
              href="/search"
              className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Find a Pro
            </Link>
            <Link
              href="/categories"
              className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/how-it-works"
              className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-neutral-100 rounded-lg"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="pt-4 space-y-2 px-4">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-100">Sign in</Button>
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
