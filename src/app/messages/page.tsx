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

export default async function MessagesPage() {
  const supabase = await createClient();

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

  // Load conversations based on role
  const { data: convos, error } = await supabase
    .from('conversations')
    .select(`
      *,
      customer:profiles!conversations_customer_id_fkey(full_name, avatar_url),
      business:businesses!conversations_business_id_fkey(name, logo_url)
    `)
    .or(`customer_id.eq.${user.id},business_id.in.(select id from businesses where owner_id = '${user.id}')`)
    .order('last_message_at', { ascending: false });

  let conversations: Conversation[] = [];

  if (!error && convos) {
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
        last_message: 'Click to view messages',
        unread_count: 0,
      };
    });
  }

  return (
    <MessagesView
      userId={user.id}
      userProfile={profile as Profile | null}
      initialConversations={conversations}
    />
  );
}
