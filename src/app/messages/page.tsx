import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MessagesView } from './messages-view';
import type { Profile } from '@/types/database';

interface Conversation {
  id: string;
  customer_id: string;
  business_id: string;
  service_request_id: string | null;
  last_message_at: string;
  created_at: string;
  other_party: {
    name: string;
    avatar_url: string | null;
  };
  last_message: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface MessagesPageProps {
  searchParams: Promise<{ business?: string; request?: string }>;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const supabase = await createClient();
  const { business: businessParam, request: requestParam } = await searchParams;

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Get businesses owned by the user for conversation filtering
  const { data: ownedBusinesses } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id);

  const businessIds = ownedBusinesses?.map((b: { id: string }) => b.id) || [];

  // If arriving via a "Contact" button (?business=<id>), find or create that conversation
  let initialSelectedId: string | null = null;
  if (businessParam && !businessIds.includes(businessParam)) {
    const { data: existing } = await supabase
      .from('conversations')
      .select('id, service_request_id')
      .eq('customer_id', user.id)
      .eq('business_id', businessParam)
      .order('last_message_at', { ascending: false });

    const match =
      existing?.find((c) => requestParam && c.service_request_id === requestParam) ||
      existing?.[0];

    if (match) {
      initialSelectedId = match.id;
    } else {
      // RLS allows customers to create conversations for themselves
      const { data: created } = await supabase
        .from('conversations')
        .insert({
          customer_id: user.id,
          business_id: businessParam,
          service_request_id: requestParam || null,
        })
        .select('id')
        .single();
      initialSelectedId = created?.id ?? null;
    }
  }

  // Load conversations based on role
  let query = supabase
    .from('conversations')
    .select(`
      *,
      customer:profiles!conversations_customer_id_fkey(full_name, avatar_url),
      business:businesses!conversations_business_id_fkey(name, logo_url)
    `);

  if (businessIds.length > 0) {
    query = query.or(`customer_id.eq.${user.id},business_id.in.(${businessIds.join(',')})`);
  } else {
    query = query.eq('customer_id', user.id);
  }

  const { data: convos, error } = await query
    .order('last_message_at', { ascending: false });

  let conversations: Conversation[] = [];

  if (!error && convos && convos.length > 0) {
    // Fetch latest message + unread counts for all conversations in one query
    const convoIds = convos.map((c: { id: string }) => c.id);
    const { data: allMessages } = await supabase
      .from('messages')
      .select('conversation_id, sender_id, content, is_read, created_at')
      .in('conversation_id', convoIds)
      .order('created_at', { ascending: false });

    const lastMessageByConvo = new Map<string, string>();
    const unreadByConvo = new Map<string, number>();
    for (const msg of allMessages || []) {
      if (!lastMessageByConvo.has(msg.conversation_id)) {
        lastMessageByConvo.set(msg.conversation_id, msg.content);
      }
      if (!msg.is_read && msg.sender_id !== user.id) {
        unreadByConvo.set(msg.conversation_id, (unreadByConvo.get(msg.conversation_id) || 0) + 1);
      }
    }

    // Transform conversations to include other party info
    conversations = convos.map((convo: {
      id: string;
      customer_id: string;
      business_id: string;
      service_request_id: string | null;
      last_message_at: string;
      created_at: string;
      customer?: { full_name: string | null; avatar_url: string | null };
      business?: { name: string | null; logo_url: string | null };
    }) => {
      const isCustomer = convo.customer_id === user.id;
      return {
        id: convo.id,
        customer_id: convo.customer_id,
        business_id: convo.business_id,
        service_request_id: convo.service_request_id,
        last_message_at: convo.last_message_at,
        created_at: convo.created_at,
        other_party: isCustomer
          ? { name: convo.business?.name || 'Business', avatar_url: convo.business?.logo_url || null }
          : { name: convo.customer?.full_name || 'Customer', avatar_url: convo.customer?.avatar_url || null },
        last_message: lastMessageByConvo.get(convo.id) || 'No messages yet — say hello!',
        unread_count: unreadByConvo.get(convo.id) || 0,
      };
    });
  }

  // Preload the opening conversation's messages so the pane renders with
  // content instead of a spinner.
  let initialMessages: Message[] = [];
  const openingId = initialSelectedId ?? conversations[0]?.id ?? null;
  if (openingId) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', openingId)
      .order('created_at', { ascending: true });
    initialMessages = (msgs as Message[]) ?? [];
  }

  return (
    <MessagesView
      userId={user.id}
      userProfile={profile as Profile | null}
      initialConversations={conversations}
      initialSelectedId={openingId}
      initialMessages={initialMessages}
    />
  );
}
