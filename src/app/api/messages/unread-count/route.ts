import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Total unread messages addressed to the caller, across every conversation
// they take part in — drives the badge on the Messages nav item.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!adminUrl || !adminKey) {
      return NextResponse.json({ count: 0 });
    }
    const admin = createAdminClient(adminUrl, adminKey);

    // Conversations the user is in, as customer or as business owner
    const { data: ownedBusinesses } = await admin
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id);

    const businessIds = (ownedBusinesses || []).map((b) => b.id);

    let query = admin.from('conversations').select('id');
    query =
      businessIds.length > 0
        ? query.or(`customer_id.eq.${user.id},business_id.in.(${businessIds.join(',')})`)
        : query.eq('customer_id', user.id);

    const { data: conversations } = await query;
    const conversationIds = (conversations || []).map((c) => c.id);
    if (!conversationIds.length) {
      return NextResponse.json({ count: 0 });
    }

    // Unread messages that someone else sent
    const { count } = await admin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('is_read', false)
      .neq('sender_id', user.id);

    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    console.error('[messages/unread-count] Unexpected error:', error);
    return NextResponse.json({ count: 0 });
  }
}
