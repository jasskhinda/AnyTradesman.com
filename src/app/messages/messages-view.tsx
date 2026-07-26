'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Search, Loader2, Send } from 'lucide-react';
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

interface MessagesViewProps {
  userId: string;
  userProfile: Profile | null;
  initialConversations: Conversation[];
  initialSelectedId?: string | null;
  initialMessages?: Message[];
}

export function MessagesView({
  userId,
  userProfile,
  initialConversations,
  initialSelectedId = null,
  initialMessages = [],
}: MessagesViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialSelectedId);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!selectedConversation) return;
    loadMessages(selectedConversation, true);

    // Light polling so incoming replies appear without a manual refresh
    const interval = setInterval(() => {
      loadMessages(selectedConversation, false);
    }, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  // Loaded through an API route rather than the browser Supabase client:
  // the client-side auth call can hang, which left this stuck on its spinner.
  // The route also marks the other party's messages as read.
  async function loadMessages(conversationId: string, showSpinner: boolean) {
    if (showSpinner) setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/messages/list?conversation_id=${encodeURIComponent(conversationId)}`
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.messages)) {
        setMessages(data.messages);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
        );
      }
    } catch {
      // leave whatever is on screen; the poll will retry
    } finally {
      if (showSpinner) setLoadingMessages(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    const content = newMessage.trim();

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selectedConversation, content }),
      });
      const data = await response.json();

      if (response.ok && data.message) {
        setNewMessage('');
        setMessages((prev) => [...prev, data.message]);
        // Reflect the new message in the conversation list and bump it to the top
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === selectedConversation
              ? { ...c, last_message: content, last_message_at: data.message.created_at }
              : c
          );
          return updated.sort(
            (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
          );
        });
      } else {
        alert(data.error || 'Failed to send message. Please try again.');
      }
    } catch {
      alert('Failed to send message. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

  const visibleConversations = searchQuery.trim()
    ? conversations.filter((c) =>
        c.other_party.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : conversations;

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header initialUser={userProfile} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>

        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto h-full">
              {visibleConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">
                    {conversations.length === 0 ? 'No conversations yet' : 'No matches found'}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {conversations.length === 0
                      ? 'Start a conversation by responding to a lead or contacting a professional'
                      : 'Try a different search'}
                  </p>
                </div>
              ) : (
                visibleConversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConversation(convo.id)}
                    className={`w-full p-4 text-left border-b border-neutral-800 hover:bg-neutral-800 transition-colors ${
                      selectedConversation === convo.id ? 'bg-neutral-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                        {convo.other_party.avatar_url ? (
                          <img src={convo.other_party.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-white font-medium">
                            {convo.other_party.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white truncate">{convo.other_party.name}</p>
                          <span className="text-xs text-neutral-500">{formatTime(convo.last_message_at)}</span>
                        </div>
                        <p className="text-sm text-neutral-400 truncate">{convo.last_message}</p>
                      </div>
                      {convo.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2 bg-neutral-900 border-neutral-800 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.sender_id === userId
                              ? 'bg-red-500 text-white'
                              : 'bg-neutral-800 text-white'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender_id === userId ? 'text-red-200' : 'text-neutral-500'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-neutral-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                  <p className="text-neutral-400">Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
