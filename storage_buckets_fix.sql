-- Ensure voice_notes storage bucket exists
-- Run this in Supabase SQL Editor

-- Create voice_notes bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice_notes', 'voice_notes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for voice_notes bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload voice notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice_notes');

CREATE POLICY IF NOT EXISTS "Allow public access to voice notes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'voice_notes');

-- Also ensure messages bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages', 'messages', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload message media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'messages');

CREATE POLICY IF NOT EXISTS "Allow public access to message media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'messages');
