-- Void Security & Persistence Patch
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Enable deletion for posts
DROP POLICY IF EXISTS "Delete own posts" ON public.posts;
CREATE POLICY "Delete own posts" ON public.posts 
FOR DELETE USING (auth.uid() = user_id);

-- 2. Enable deletion for reels
DROP POLICY IF EXISTS "Delete own reels" ON public.reels;
CREATE POLICY "Delete own reels" ON public.reels 
FOR DELETE USING (auth.uid() = user_id);

-- 3. Ensure profiles are updatable by owners
DROP POLICY IF EXISTS "Own profile updates" ON public.profiles;
CREATE POLICY "Own profile updates" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- 4. Enable INSERT for storage (if not already working)
-- This ensures you can upload post media and avatars correctly
DROP POLICY IF EXISTS "Auth upload" ON storage.objects;
CREATE POLICY "Auth upload" ON storage.objects 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
