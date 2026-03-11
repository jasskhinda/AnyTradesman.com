import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to change your password' },
        { status: 401 }
      );
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Password update failed:', error.message);
      // Don't expose internal Supabase error messages to the client
      const userMessage = error.message.includes('should be different')
        ? 'New password must be different from your current password.'
        : 'Failed to update password. Please try again.';
      return NextResponse.json(
        { error: userMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
