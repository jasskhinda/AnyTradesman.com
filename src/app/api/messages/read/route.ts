import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Marks all messages from the other party as read.
// Uses the admin client because RLS has no UPDATE policy on messages.
export async function POST(request: Request) {
  try {
    const { conversation_id } = await request.json();

    if (!conversation_id) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    }

    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!adminUrl || !adminKey) {
      return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
    }
    const admin = createAdminClient(adminUrl, adminKey);

    // Verify the caller participates in this conversation
    const { data: conversation } = await admin
      .from('conversations')
      .select('id, customer_id, businesses(owner_id)')
      .eq('id', conversation_id)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    const business = Array.isArray(conversation.businesses)
      ? conversation.businesses[0]
      : conversation.businesses;
    const isParticipant =
      conversation.customer_id === user.id || business?.owner_id === user.id;

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await admin
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversation_id)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[messages/read] Unexpected error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
