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

-- 4. Enable Realtime for these tables (if not already enabled)
-- Note: This is usually done in the Supabase Dashboard, but these commands help:
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.chat_participants;
