"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProfileHeader } from "@/components/ProfileHeader";
import { FeedItem } from "@/components/FeedItem";
import { Grid, List, Video, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp, User, FeedPost } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { MessageCircle, Lock } from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { currentUser, toggleLike, addComment, toggleFollow, createChat } =
    useApp();
  const router = useRouter();

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

        // Calculate real stats for this user
        const { count: postsCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        const { count: followersCount } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId);

        const { count: followingCount } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", userId);

        setUser({
          id: profile.id,
          name: profile.name,
          handle: profile.handle,
          avatar: profile.avatar_url,
          bio: profile.bio || "",
          coverPhoto: profile.cover_url || "",
          isVerified: profile.is_verified,
          isPrivate: profile.is_private,
          status: "offline",
          isFriend: !!follow,
          stats: {
            posts: postsCount || 0,
            followers: followersCount || 0,
            following: followingCount || 0,
          },
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
    console.log("handleFollowToggle called");
    try {
      await toggleFollow(userId);
      // Re-check follow status
      const { data: follow, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId)
        .single();

      console.log("Follow status after toggle:", follow, "Error:", error);
      setUser((prev) => (prev ? { ...prev, isFriend: !!follow } : null));
    } catch (error) {
      console.error("Error in handleFollowToggle:", error);
    }
  };

  const handleMessageUser = async () => {
    if (!user) return;
    const chatId = await createChat(user.id);
    if (chatId) {
      router.push(`/chats/${chatId}`);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      <ProfileHeader
        user={user}
        isCurrentUser={currentUser.id === user.id}
        onFollowToggle={handleFollowToggle}
      />

      <div className="px-4">
        {user.id !== currentUser.id && user.isFriend && (
          <Button
            variant="outline"
            className="w-full mb-6 gap-2 rounded-xl h-12 font-bold"
            onClick={handleMessageUser}
          >
            <MessageCircle size={20} />
            Message
          </Button>
        )}

        {user.isPrivate && !user.isFriend && user.id !== currentUser.id ? (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center border-2 border-dashed border-border/50 rounded-3xl bg-secondary/10">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
              <Lock size={40} className="text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-black mb-2 uppercase tracking-tighter">
              Private Account
            </h2>
            <p className="text-muted-foreground text-sm max-w-[200px]">
              Follow this user to see their posts and reels.
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
