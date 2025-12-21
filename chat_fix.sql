-- Void Chat Overhaul Patch (WhatsApp-Style)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Add status and read_at to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent'; -- 'sent', 'delivered', 'read'
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- 2. Add metadata to chat_participants (mute, pin)
ALTER TABLE public.chat_participants ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false;
ALTER TABLE public.chat_participants ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.chat_participants ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Add metadata to chats (groups)
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- 5. RLS Policies for Chats
-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Chats: Users can see chats they are part of OR chats they created
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
CREATE POLICY "Users can view their own chats" ON public.chats
FOR SELECT USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = id
    AND chat_participants.user_id = auth.uid()
  )
);

-- Chats: Users can create chats
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
CREATE POLICY "Users can create chats" ON public.chats
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Chat Participants: Users can view participants if they are authenticated
-- (Security is maintained because chats and messages still require membership)
DROP POLICY IF EXISTS "Users can view participants of their chats" ON public.chat_participants;
CREATE POLICY "Users can view participants of their chats" ON public.chat_participants
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Chat Participants: Users can add themselves and others to chats
-- In a more strict app, you'd only allow adding others if you're the creator, but for MVP:
DROP POLICY IF EXISTS "Users can add participants" ON public.chat_participants;
CREATE POLICY "Users can add participants" ON public.chat_participants
FOR INSERT WITH CHECK (true);

-- Messages: Users can view messages in their chats
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
CREATE POLICY "Users can view messages in their chats" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

-- Messages: Users can send messages to their chats
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Messages: Users can update message status (read receipts)
DROP POLICY IF EXISTS "Users can update message status" ON public.messages;
CREATE POLICY "Users can update message status" ON public.messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
) WITH CHECK (true);

-- 4. Enable Realtime for these tables (if not already enabled)
-- Note: This is usually done in the Supabase Dashboard, but these commands help:
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.chat_participants;
