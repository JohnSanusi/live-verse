"use client";

import React, { useState } from "react";
import { FeedItem } from "@/components/FeedItem";
import { Header } from "@/components/Header";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/context/AppContext";

export default function FeedsPage() {
  const { feeds, toggleLike, addComment, createPost } = useApp();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState("");

  const handleCreatePost = () => {
    if (postText.trim()) {
      createPost(postText, postImage || undefined);
      setPostText("");
      setPostImage("");
      setShowCreatePost(false);
    }
  };

  return (
    <div className="pb-20">
      <Header 
        title="Feed" 
        action={
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-full"
            onClick={() => setShowCreatePost(true)}
          >
            <Plus size={20} />
          </Button>
        } 
      />
      
      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Post</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowCreatePost(false)}
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <textarea
                placeholder="What's on your mind?"
                className="w-full bg-secondary/50 border border-border rounded-lg p-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              
              <Input
                placeholder="Image URL (optional)"
                className="bg-secondary/50 border-border"
                value={postImage}
                onChange={(e) => setPostImage(e.target.value)}
              />
              
              <Button 
                className="w-full bg-primary text-primary-foreground"
                onClick={handleCreatePost}
                disabled={!postText.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="space-y-4">
        {feeds.map((feed) => (
          <FeedItem 
            key={feed.id} 
            {...feed} 
            onLike={() => toggleLike(feed.id)}
            onComment={(text) => addComment(feed.id, text)}
          />
        ))}
      </main>
    </div>
  );
}
