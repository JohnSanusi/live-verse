-- Initial Schema for Void
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    handle TEXT UNIQUE,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was already there
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='name') THEN
        ALTER TABLE public.profiles ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='handle') THEN
        ALTER TABLE public.profiles ADD COLUMN handle TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='cover_url') THEN
        ALTER TABLE public.profiles ADD COLUMN cover_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_private') THEN
        ALTER TABLE public.profiles ADD COLUMN is_private BOOLEAN DEFAULT false;
    END IF;
END $$;

-- -------------------------------------------------------
-- Auth Automation (Security Fix)
-- -------------------------------------------------------

-- Create a secure function to handle new user signups
-- SET search_path = '' is required by Supabase Security Advisor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, handle, avatar_url, bio)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    ''
  );
  RETURN new;
END;
$$;

-- Trigger to call the function onทุก signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Posts
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reels
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    video_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes (Generic Pattern)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL, -- 'post' or 'reel'
    reaction TEXT DEFAULT 'like',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- Comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Items
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Chats
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    is_group BOOLEAN DEFAULT false,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Participants
CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Statuses (Stories)
CREATE TABLE IF NOT EXISTS public.statuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'unfollow'
    target_id UUID,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search History
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    query TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, query)
);

-- -------------------------------------------------------
-- RLS Activation
-- -------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Policies
-- -------------------------------------------------------

-- Profiles
DROP POLICY IF EXISTS "Public profiles" ON profiles;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Own profile updates" ON profiles;
CREATE POLICY "Own profile updates" ON profiles FOR UPDATE USING ((select auth.uid()) = id);

-- Publicly readable tables
DROP POLICY IF EXISTS "Public posts" ON posts;
CREATE POLICY "Public posts" ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reels" ON reels;
CREATE POLICY "Public reels" ON reels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public likes" ON likes;
CREATE POLICY "Public likes" ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public comments" ON comments;
CREATE POLICY "Public comments" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public follows" ON follows;
CREATE POLICY "Public follows" ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public marketplace" ON marketplace_items;
CREATE POLICY "Public marketplace" ON marketplace_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public statuses" ON statuses;
CREATE POLICY "Public statuses" ON statuses FOR SELECT USING (true);

-- Authenticated Creations
DROP POLICY IF EXISTS "Create posts" ON posts;
CREATE POLICY "Create posts" ON posts FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Create reels" ON reels;
CREATE POLICY "Create reels" ON reels FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Handle likes" ON likes;
CREATE POLICY "Handle likes" ON likes FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Handle comments" ON comments;
CREATE POLICY "Handle comments" ON comments FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Handle follows" ON follows;
CREATE POLICY "Handle follows" ON follows FOR ALL USING ((select auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Handle marketplace" ON marketplace_items;
CREATE POLICY "Handle marketplace" ON marketplace_items FOR ALL USING ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Handle statuses" ON statuses;
CREATE POLICY "Handle statuses" ON statuses FOR ALL USING ((select auth.uid()) = user_id);

-- Chat Related
DROP POLICY IF EXISTS "Chat view" ON chats;
CREATE POLICY "Chat view" ON chats FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = id AND user_id = (select auth.uid()))
);

DROP POLICY IF EXISTS "Message view" ON messages;
CREATE POLICY "Message view" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = messages.chat_id AND user_id = (select auth.uid()))
);

DROP POLICY IF EXISTS "Send messages" ON messages;
CREATE POLICY "Send messages" ON messages FOR INSERT WITH CHECK ((select auth.uid()) = sender_id);

-- User Specific
DROP POLICY IF EXISTS "Own notifications" ON notifications;
CREATE POLICY "Own notifications" ON notifications FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Create notifications" ON notifications;
CREATE POLICY "Create notifications" ON notifications FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Update notifications" ON notifications;
CREATE POLICY "Update notifications" ON notifications FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Own search history" ON search_history;
CREATE POLICY "Own search history" ON search_history FOR ALL USING ((select auth.uid()) = user_id);

-- -------------------------------------------------------
-- Storage
-- -------------------------------------------------------

-- Create all required buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reels', 'reels', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('messages', 'messages', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('statuses', 'statuses', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace', 'marketplace', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public access" ON storage.objects;
CREATE POLICY "Public access" ON storage.objects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth upload" ON storage.objects;
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Auth update" ON storage.objects;
CREATE POLICY "Auth update" ON storage.objects FOR UPDATE USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Auth delete" ON storage.objects;
CREATE POLICY "Auth delete" ON storage.objects FOR DELETE USING ((select auth.uid()) IS NOT NULL);

-- -------------------------------------------------------
-- Useful Diagnostics (Run manually if needed)
-- -------------------------------------------------------
-- SELECT count(*) FROM public.profiles;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
-- SELECT id, name, public FROM storage.buckets;

