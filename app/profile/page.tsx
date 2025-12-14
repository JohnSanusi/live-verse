"use client";

import React from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { FeedItem } from "@/components/FeedItem";
import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";

export default function ProfilePage() {
  const { currentUser, feeds, toggleLike, addComment } = useApp();

  // Filter posts by current user (mock logic, assuming user posts are in feeds)
  // For this prototype, we'll just show all feeds as "user's posts" to populate the view
  // or we could filter if we added authorId to feeds. Let's just show the first 2.
  const userPosts = feeds.slice(0, 2);

  return (
    <div className="pb-20 min-h-screen bg-background">
      <ProfileHeader user={currentUser} />
      
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground">Posts</h2>
          <div className="flex bg-secondary/50 rounded-lg p-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded bg-background shadow-sm">
              <List size={16} />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded text-muted-foreground">
              <Grid size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {userPosts.map((post) => (
            <FeedItem 
                key={post.id} 
                {...post} 
                onLike={() => toggleLike(post.id)}
                onComment={(text) => addComment(post.id, text)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
