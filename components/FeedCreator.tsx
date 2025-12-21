"use client";

import React, { useState } from "react";
import { X, Image as ImageIcon, Send, Film } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";

interface FeedCreatorProps {
  onClose: () => void;
}

export const FeedCreator = ({ onClose }: FeedCreatorProps) => {
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const { createPost, currentUser } = useApp();
  const { showToast } = useToast();

  const handlePost = async () => {
    if (!text.trim() && !mediaUrl) return;

    try {
      await createPost(text, mediaFile || mediaUrl || undefined);
      showToast("Post shared successfully!", "success");
      onClose();
    } catch (err: any) {
      console.error("Failed to share post:", err);
      showToast(
        err.message || "Failed to share post. Please try again.",
        "error"
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaType(file.type.startsWith("video") ? "video" : "image");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-background border-t sm:border border-border rounded-t-[3rem] sm:rounded-[2.5rem] w-full max-w-xl p-6 sm:p-8 shadow-2xl overflow-hidden relative"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 overflow-hidden shadow-inner">
              {currentUser.avatar.length > 2 ? (
                <img
                  src={currentUser.avatar}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser.name[0]
              )}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Create Post
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Public Feed
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full bg-secondary/50 hover:bg-secondary active-scale"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-6">
          <textarea
            placeholder="What's on your mind?"
            className="w-full bg-transparent border-none rounded-2xl p-0 min-h-[150px] resize-none focus:outline-none text-xl placeholder:text-muted-foreground/40 font-medium"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />

          <AnimatePresence>
            {mediaUrl && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative rounded-[2rem] overflow-hidden border border-border/50 bg-secondary/30 group aspect-video"
              >
                {mediaType === "image" ? (
                  <img src={mediaUrl} className="w-full h-full object-cover" />
                ) : (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                <button
                  className="absolute top-4 right-4 h-8 w-8 bg-secondary/80 backdrop-blur-md text-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setMediaUrl("");
                    setMediaType(null);
                  }}
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="feed-upload"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
              <Button
                variant="secondary"
                size="sm"
                className="h-12 w-12 rounded-2xl p-0 flex items-center justify-center bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all active-scale"
                onClick={() => document.getElementById("feed-upload")?.click()}
              >
                <ImageIcon size={20} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-12 w-12 rounded-2xl p-0 flex items-center justify-center bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all active-scale"
                onClick={() => document.getElementById("feed-upload")?.click()}
              >
                <Film size={20} />
              </Button>
            </div>

            <Button
              className="px-8 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-lg shadow-primary/20 active-scale disabled:opacity-20 transition-all"
              onClick={handlePost}
              disabled={!text.trim() && !mediaUrl}
            >
              Post
              <Send size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
