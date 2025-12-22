-- ULTIMATE CHAT FIX: Guaranteed Access for All Users
-- Run this in Supabase SQL Editor to fix "loading chats" issue
-- This ensures EVERY authenticated user can see their chats

-- 1. Ensure profiles table allows reading other users (critical for chat participants)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
FOR SELECT USING (true); -- Allow all authenticated users to view all profiles

-- 2. Fix chat_participants to be fully readable
DROP POLICY IF EXISTS "Users can view participants" ON public.chat_participants;
CREATE POLICY "Users can view participants" ON public.chat_participants
FOR SELECT USING (true); -- Must be true for joins to work

-- 3. Fix chats table - allow viewing if you're a participant
DROP POLICY IF EXISTS "Users can view chats" ON public.chats;
CREATE POLICY "Users can view chats" ON public.chats
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = chats.id
    AND chat_participants.user_id = auth.uid()
  )
);

-- 4. Fix messages - allow viewing if you're a chat participant
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
CREATE POLICY "Users can view messages" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

-- 5. Allow inserting messages
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 6. Allow updating messages (for read receipts)
DROP POLICY IF EXISTS "Users can update messages" ON public.messages;
CREATE POLICY "Users can update messages" ON public.messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

-- 7. Ensure updated_at column exists
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 8. Ensure message status columns exist
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- 9. Create trigger to update chat timestamp on new message
CREATE OR REPLACE FUNCTION public.update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats
    SET updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER bypasses RLS

DROP TRIGGER IF EXISTS trigger_update_chat_timestamp ON public.messages;
CREATE TRIGGER trigger_update_chat_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_timestamp();

-- 10. Grant necessary permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.chats TO authenticated;
GRANT SELECT ON public.chat_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;
