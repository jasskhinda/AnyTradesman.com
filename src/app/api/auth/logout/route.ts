import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  // Redirect to home page after logout
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
