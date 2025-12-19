"use client";

import React from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { FeedItem } from "@/components/FeedItem";
import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";

import { useSearchParams } from "next/navigation";

export default function ProfilePage() {
  const { currentUser, feeds, reels, toggleLike, addComment } = useApp();
  const searchParams = useSearchParams();
  const autoEdit = searchParams.get("edit") === "true";
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");

  const userPosts = feeds.filter((post) => post.user.id === currentUser.id);
  const userReels = reels.filter((reel) => reel.user.id === currentUser.id);

  return (
    <div className="pb-20 min-h-screen bg-background">
      <ProfileHeader user={currentUser} autoEdit={autoEdit} />

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

        {/* Content */}
        {activeTab === "posts" ? (
          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <FeedItem
                  key={post.id}
                  {...post}
                  onLike={() => toggleLike(post.id)}
                  onComment={(text) => addComment(post.id, text)}
                />
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Grid size={48} className="mx-auto mb-4 opacity-20" />
                <p>No posts yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {userReels.length > 0 ? (
              userReels.map((reel) => (
                <div
                  key={reel.id}
                  className="aspect-[9/16] bg-muted relative rounded-md overflow-hidden"
                >
                  <video
                    src={reel.video}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-2 left-2 text-white text-xs font-bold drop-shadow-md flex items-center gap-1">
                    <Play size={10} className="fill-current" />
                    {reel.stats.likes}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-muted-foreground">
                <Video size={48} className="mx-auto mb-4 opacity-20" />
                <p>No reels yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
