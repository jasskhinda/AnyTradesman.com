-- Enable live message delivery.
--
-- The realtime WebSocket already connects, but Postgres only streams changes
-- for tables in the supabase_realtime publication. Without this, a chat client
-- subscribes successfully and then never receives anything, so messages only
-- appear on refresh.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> paste -> Run).

-- Realtime sends the full new row for INSERTs regardless, but REPLICA
-- IDENTITY FULL also gives us old values on UPDATE (used for read receipts).
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;
END $$;
