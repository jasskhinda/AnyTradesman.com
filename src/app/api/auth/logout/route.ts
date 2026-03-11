import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ success: true }); // Still return success — user expects to be logged out
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
  } catch (err) {
    console.error('Logout error:', err);
  }

  // Always redirect to home page, even if signOut had an error
  const url = new URL('/', request.url);
  return NextResponse.redirect(url);
}
