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

CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile updates" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Publicly readable tables
CREATE POLICY "Public posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public reels" ON reels FOR SELECT USING (true);
CREATE POLICY "Public likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Public comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Public marketplace" ON marketplace_items FOR SELECT USING (true);
CREATE POLICY "Public statuses" ON statuses FOR SELECT USING (true);

-- Authenticated Creations
CREATE POLICY "Create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Create reels" ON reels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Handle likes" ON likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Handle comments" ON comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Handle follows" ON follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Handle marketplace" ON marketplace_items FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Handle statuses" ON statuses FOR ALL USING (auth.uid() = user_id);

-- Chat Related
CREATE POLICY "Chat view" ON chats FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = id AND user_id = auth.uid())
);
CREATE POLICY "Message view" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid())
);
CREATE POLICY "Send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- User Specific
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own search history" ON search_history FOR ALL USING (auth.uid() = user_id);

-- -------------------------------------------------------
-- Storage
-- -------------------------------------------------------

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reels', 'reels', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public access" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'posts', 'reels'));
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('avatars', 'posts', 'reels'));
