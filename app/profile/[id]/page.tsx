"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProfileHeader } from "@/components/ProfileHeader";
import { FeedItem } from "@/components/FeedItem";
import { Grid, List, Video, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp, User, FeedPost } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { currentUser, toggleLike, addComment } = useApp();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile) {
        // Check if followed
        const { data: follow } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId)
          .single();

        setUser({
          id: profile.id,
          name: profile.name,
          handle: profile.handle,
          avatar: profile.avatar_url,
          bio: profile.bio || "",
          isVerified: profile.is_verified,
          status: "offline",
          isFriend: !!follow,
          stats: { posts: 0, followers: 0, following: 0 }, // Fetch real stats later if needed
        });

        // 2. Fetch Posts
        const { data: postsData } = await supabase
          .from("posts")
          .select(`*, profiles:user_id(*), likes(*), comments(*)`)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (postsData) {
          setPosts(
            postsData.map((p: any) => ({
              id: p.id,
              user: { ...profile, id: profile.id }, // fast mapping
              content: p.content,
              stats: { likes: p.likes.length, comments: p.comments.length },
              liked: p.likes.some((l: any) => l.user_id === currentUser.id),
              commentsList: [],
            }))
          );
        }
      }
      setIsLoading(false);
    };

    if (userId) fetchProfile();
  }, [userId, currentUser.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        User not found
      </div>
    );
  }

  const handleFollowToggle = async () => {
    await toggleFollow(userId);
    // Re-check follow status
    const { data: follow } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUser.id)
      .eq("following_id", userId)
      .single();

    setUser((prev) => (prev ? { ...prev, isFriend: !!follow } : null));
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      <ProfileHeader
        user={user}
        isCurrentUser={currentUser.id === user.id}
        onFollowToggle={handleFollowToggle}
      />

      <div className="px-4">
        {/* Tabs */}
        <div className="flex p-1 bg-secondary/30 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "posts"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid size={18} />
            <span>Posts</span>
          </button>
          <button
            onClick={() => setActiveTab("reels")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "reels"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video size={18} />
            <span>Reels</span>
          </button>
        </div>

        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <FeedItem
                key={post.id}
                {...post}
                onLike={() => toggleLike(post.id)}
                onComment={(text) => addComment(post.id, text)}
              />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground/50">
              <Grid size={48} className="mx-auto mb-4 opacity-20" />
              No posts yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
