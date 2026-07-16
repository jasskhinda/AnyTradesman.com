import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Sends a message in a conversation the caller participates in.
// Uses the admin client because RLS has no UPDATE policy for
// conversations.last_message_at.
export async function POST(request: Request) {
  try {
    const { conversation_id, content } = await request.json();

    if (!conversation_id || !content?.trim()) {
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
      .select('id, customer_id, business_id, businesses(owner_id)')
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

    const { data: message, error: insertError } = await admin
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content: content.trim(),
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('[messages/send] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    await admin
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation_id);

    return NextResponse.json({ message });
  } catch (error) {
    console.error('[messages/send] Unexpected error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
