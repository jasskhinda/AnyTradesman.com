import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') || 'signup';
  const redirect_to = searchParams.get('redirect_to') || `${process.env.NEXT_PUBLIC_APP_URL || 'https://anytradesmen.com'}/api/auth/callback`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!token_hash || !supabaseUrl) {
    return NextResponse.redirect(new URL('/email-verified?status=error&error=Invalid+verification+link', request.url));
  }

  const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${type}&redirect_to=${encodeURIComponent(redirect_to)}`;

  return NextResponse.redirect(verifyUrl);
}
