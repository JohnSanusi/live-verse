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

      <StatusList />

      <AnimatePresence>
        {showCreatePost && (
          <FeedCreator onClose={() => setShowCreatePost(false)} />
        )}
      </AnimatePresence>

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
