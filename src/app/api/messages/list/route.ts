import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Returns the messages in a conversation the caller participates in.
// The client polls this instead of querying Supabase from the browser, which
// keeps message loading off the browser client entirely.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversation_id' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!adminUrl || !adminKey) {
      return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
    }
    const admin = createAdminClient(adminUrl, adminKey);

    const { data: conversation } = await admin
      .from('conversations')
      .select('id, customer_id, business_id, businesses(owner_id)')
      .eq('id', conversationId)
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

    const { data: messages, error } = await admin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[messages/list] Query failed:', error.message);
      return NextResponse.json({ error: 'Could not load messages.' }, { status: 500 });
    }

    // Opening a conversation marks the other party's messages as read
    await admin
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({ messages: messages ?? [] });
  } catch (error) {
    console.error('[messages/list] Unexpected error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
