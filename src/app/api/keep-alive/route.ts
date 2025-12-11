import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// This endpoint keeps the Supabase project active
// Set up a cron job to hit this endpoint daily
// Use https://cron-job.org (free) or similar service

export async function GET() {
  try {
    const supabase = await createClient();

    // Simple query to keep the database active
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Keep-alive error:', error);
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Database connection successful',
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
