import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const supabase = await createClient();

  await supabase.auth.signOut();

  // Redirect to home page after logout
  const url = new URL('/', request.url);
  return NextResponse.redirect(url);
}
