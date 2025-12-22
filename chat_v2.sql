-- Chat Overhaul Patch V2 (Voice Notes & Read Receipts)
-- Adds audio support and improves read receipt tracking

-- 1. Add audio_url to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- 2. Enable Realtime Safely
-- (Wait, if it's already a member, this line will fail. Let's use a safer approach or comment it out if you've already run it)
-- To check if it's already enabled, you can run this, but usually just skipping it is fine if you've done it once.
-- alter publication supabase_realtime add table public.messages; 
-- ^ Commented out to prevent "already member" error. Run manually if Realtime isn't working.

-- 3. Update RLS to allow deleting messages (for "Clear Chat")
DROP POLICY IF EXISTS "Users can delete their messages" ON public.messages;
CREATE POLICY "Users can delete their messages" ON public.messages
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

-- 4. Function to mark all messages in a chat as read with timestamp
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(target_chat_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.messages
  SET status = 'read', read_at = NOW()
  WHERE chat_id = target_chat_id
  AND sender_id != auth.uid()
  AND status != 'read';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
