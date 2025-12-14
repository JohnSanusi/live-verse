"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProfileHeader } from "@/components/ProfileHeader";
import { FeedItem } from "@/components/FeedItem";
import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { users, feeds, toggleLike, addComment } = useApp();

  const user = users.find(u => u.id === userId);
  
  // Filter posts by this user (mock logic)
  // In a real app, we'd filter by authorId. Here we'll just show some random posts for demo.
  const userPosts = feeds.slice(0, 2); 

  if (!user) {
    return <div className="p-10 text-center text-muted-foreground">User not found</div>;
  }

  return (
    <div className="pb-20 min-h-screen bg-background">
      <ProfileHeader user={user} isCurrentUser={false} />
      
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
