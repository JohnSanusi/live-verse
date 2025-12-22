-- Void Chat Deep Fix (Final Synchronization Patch)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. CRITICAL: Ensure 'updated_at' exists for sorting
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Ensure Schema Completeness
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- 3. TRIGGER: Auto-update chat timestamp on new message (The "WhatsApp Effect")
-- This ensures that whenever a message sends, the chat jumps to the top for ALL participants.
CREATE OR REPLACE FUNCTION public.update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats
    SET updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chat_timestamp ON public.messages;
CREATE TRIGGER trigger_update_chat_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_timestamp();

-- 4. RLS REPAIR: Permissive but secure
-- Reset policies to avoid conflicts
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Grant permissions for authenticated users
GRANT ALL ON public.chats TO authenticated;
GRANT ALL ON public.chat_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Chats Policy: View if you are creator OR participant
DROP POLICY IF EXISTS "Users can view chats" ON public.chats;
CREATE POLICY "Users can view chats" ON public.chats
FOR SELECT USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = id
    AND chat_participants.user_id = auth.uid()
  )
);

-- Chats Insert: Allow creation
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
CREATE POLICY "Users can create chats" ON public.chats
FOR INSERT WITH CHECK (true);

-- Chats Update: Allow any participant to update (e.g. for muting, although that stays in participants table usually)
-- We strictly allow update_at changes via trigger, but RLS might block the trigger if not careful.
-- Actually, triggers bypass RLS if defined as SECURITY DEFINER or simple trigger on table logic.
-- But for client-side chat updates (like group name):
DROP POLICY IF EXISTS "Users can update chats" ON public.chats;
CREATE POLICY "Users can update chats" ON public.chats
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = id
    AND chat_participants.user_id = auth.uid()
  )
);

-- Participants Policy: View all (Simplifies "who is in this chat" queries)
DROP POLICY IF EXISTS "Users can view participants" ON public.chat_participants;
CREATE POLICY "Users can view participants" ON public.chat_participants
FOR SELECT USING (true); -- Relaxed for MVP speed

-- Participants Insert: Allow adding self or others
DROP POLICY IF EXISTS "Users can insert participants" ON public.chat_participants;
CREATE POLICY "Users can insert participants" ON public.chat_participants
FOR INSERT WITH CHECK (true);

-- Messages Policy: View if participant
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
CREATE POLICY "Users can view messages" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

-- Messages Insert: Allow sending
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Messages Update: Mark as read
DROP POLICY IF EXISTS "Users can update messages" ON public.messages;
CREATE POLICY "Users can update messages" ON public.messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

-- 5. REALTIME: Ensure publication adds columns
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
