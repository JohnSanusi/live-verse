"use client";

import React, { useState } from "react";
import { FeedItem } from "@/components/FeedItem";
import { Header } from "@/components/Header";
import { StatusList } from "@/components/StatusList";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { FeedCreator } from "@/components/FeedCreator";
import { AnimatePresence } from "framer-motion";
import { PostSkeleton } from "@/components/ui/Skeleton";

export default function FeedsPage() {
  const { feeds, toggleLike, addComment, createPost, isLoading } = useApp();
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
            variant="primary"
            size="sm"
            className="h-9 px-4 rounded-full flex items-center gap-2 font-bold"
            onClick={() => setShowCreatePost(true)}
          >
            <Plus size={18} />
            <span className="text-xs">Create Post</span>
          </Button>
        }
      />

      <StatusList />

      <AnimatePresence>
        {showCreatePost && (
          <FeedCreator onClose={() => setShowCreatePost(false)} />
        )}
      </AnimatePresence>

      <main className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : (
          feeds.map((feed) => (
            <FeedItem
              key={feed.id}
              {...feed}
              onLike={() => toggleLike(feed.id, "post")}
              onComment={(text) => addComment(feed.id, text)}
            />
          ))
        )}
      </main>
    </div>
  );
}
