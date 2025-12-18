"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  Plus,
  X,
  Music,
  Disc,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import { EliteBadge } from "@/components/EliteBadge";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ReelsPage() {
  const [showCreateReel, setShowCreateReel] = useState(false);
  const [reelCaption, setReelCaption] = useState("");
  const [reelVideo, setReelVideo] = useState("");
  const [likedReels, setLikedReels] = useState<string[]>([]);
  const [showHeart, setShowHeart] = useState<string | null>(null);
  const [reelFile, setReelFile] = useState<File | null>(null);

  const { createReel, reels, toggleLike } = useApp();
  const { showToast } = useToast();

  const handleCreateReel = () => {
    if (reelCaption.trim() && (reelFile || reelVideo)) {
      createReel(reelCaption, reelFile || reelVideo);
      setReelCaption("");
      setReelVideo("");
      setReelFile(null);
      setShowCreateReel(false);
      showToast("Reel created successfully!", "success");
    }
  };

  const handleAction = (action: string) => {
    showToast(`${action}!`, "success");
  };

  const handleDoubleTap = (id: string) => {
    if (!likedReels.includes(id)) {
      setLikedReels((prev) => [...prev, id]);
      toggleLike(id, "reel");
    }
    setShowHeart(id);
    setTimeout(() => setShowHeart(null), 1000);
  };

  const toggleReelLike = (id: string) => {
    setLikedReels((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    toggleLike(id, "reel");
  };

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      <Header
        title="Reels"
        className="bg-gradient-to-b from-black/80 to-transparent border-none text-white absolute top-0 left-0 right-0 z-50"
        action={
          <Button
            size="sm"
            className="h-9 px-4 rounded-full bg-white text-black hover:bg-white/90 shadow-lg active-scale transition-all flex items-center gap-2 border-none"
            onClick={() => setShowCreateReel(true)}
          >
            <Plus size={16} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Create
            </span>
          </Button>
        }
      />

      {/* Create Reel Modal */}
      <AnimatePresence>
        {showCreateReel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-background border-t sm:border border-border rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight">
                  Create Reel
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-secondary/50 hover:bg-secondary active-scale"
                  onClick={() => setShowCreateReel(false)}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-6">
                <input
                  type="file"
                  id="reel-video-upload"
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setReelFile(file);
                      const url = URL.createObjectURL(file);
                      setReelVideo(url);
                    }
                  }}
                />

                {!reelVideo ? (
                  <Button
                    variant="secondary"
                    className="w-full h-40 border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    onClick={() =>
                      document.getElementById("reel-video-upload")?.click()
                    }
                  >
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Play size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                      Select Video
                    </span>
                  </Button>
                ) : (
                  <div className="relative aspect-[9/16] max-h-60 mx-auto rounded-3xl overflow-hidden bg-muted border border-border group shadow-xl">
                    <video
                      src={reelVideo}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-4 right-4 h-8 w-8 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setReelVideo("")}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <textarea
                  placeholder="Write a caption..."
                  className="w-full bg-secondary/30 border-none rounded-2xl p-4 min-h-[120px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm font-medium"
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                />

                <Button
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] active-scale shadow-lg shadow-primary/20"
                  onClick={handleCreateReel}
                  disabled={!reelCaption.trim() || !reelVideo.trim()}
                >
                  Post Reel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {reels.map((reel: any) => (
          <div
            key={reel.id}
            className="h-full w-full snap-start snap-always relative flex items-center justify-center bg-black group/reel"
            onDoubleClick={() => handleDoubleTap(reel.id)}
          >
            {/* Video Container */}
            <div className="relative w-full h-full sm:max-w-[420px] mx-auto bg-neutral-900 overflow-hidden sm:h-[96vh] sm:my-[2vh] sm:rounded-2xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* YouTube Shorts style progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 z-50">
                <div className="h-full bg-white/60 w-1/3 shadow-[0_0_10px_white]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Play
                  size={80}
                  className="text-white/10 group-hover/reel:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Double Tap Heart */}
              <AnimatePresence>
                {showHeart === reel.id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                  >
                    <Heart
                      size={120}
                      className="text-red-500 fill-current shadow-2xl drop-shadow-2xl"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Gradient Overlays */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
              <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent z-10" />

              {/* Overlay Content */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 pb-32 sm:pb-20 z-20">
                <style jsx>{`
                  @keyframes scroll-text {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(-50%);
                    }
                  }
                  @keyframes spin-disk {
                    from {
                      transform: rotate(0deg);
                    }
                    to {
                      transform: rotate(360deg);
                    }
                  }
                  .animate-scroll {
                    display: inline-block;
                    white-space: nowrap;
                    animation: scroll-text 10s linear infinite;
                  }
                  .animate-spin-slow {
                    animation: spin-disk 3s linear infinite;
                  }
                `}</style>

                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    {/* User Info & Follow */}
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/profile/${reel.user.id}`}
                        className="flex items-center gap-2 active-scale"
                      >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg">
                          <div className="h-full w-full rounded-full bg-black overflow-hidden flex items-center justify-center text-white font-black text-xs border border-white/10">
                            {reel.user.avatar}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-white text-sm tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {reel.user.handle}
                          </p>
                          {reel.user.isVerified && <EliteBadge size={12} />}
                        </div>
                      </Link>
                      <Button
                        variant="primary"
                        size="sm"
                        className="h-8 px-4 rounded-full bg-primary text-primary-foreground text-[11px] font-black tracking-tight active-scale ml-2 shadow-[0_4px_12px_rgba(255,215,0,0.3)] border-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction("Following");
                        }}
                      >
                        Follow
                      </Button>
                    </div>

                    {/* Caption */}
                    <p className="text-white text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium max-w-[90%] mb-1">
                      {reel.caption}
                    </p>

                    {/* Audio Info (YouTube Style Marquee) */}
                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full w-fit max-w-[180px] overflow-hidden group/audio">
                      <Music size={12} className="text-white shrink-0" />
                      <div className="overflow-hidden whitespace-nowrap">
                        <div className="animate-scroll flex gap-4">
                          <span className="text-[10px] text-white font-medium">
                            Original Audio — {reel.user.name}
                          </span>
                          <span className="text-[10px] text-white font-medium">
                            Original Audio — {reel.user.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Actions */}
                  <div className="flex flex-col gap-6 items-center mb-10">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-all active:scale-75 ${
                          reel.liked ? "text-red-500" : "text-white"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReelLike(reel.id);
                        }}
                      >
                        <Heart
                          size={26}
                          className={
                            reel.liked
                              ? "fill-current"
                              : "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                          }
                        />
                      </button>
                      <span className="text-[11px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {reel.stats.likes}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <button
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white transition-all active:scale-75"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction("Comments");
                        }}
                      >
                        <MessageCircle
                          size={26}
                          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                        />
                      </button>
                      <span className="text-[11px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {reel.stats.comments}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <button
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white transition-all active:scale-75"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction("Shared");
                        }}
                      >
                        <Share2
                          size={26}
                          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                        />
                      </button>
                      <span className="text-[11px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {reel.stats.shares}
                      </span>
                    </div>

                    <button
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white transition-all active:scale-75"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("More");
                      }}
                    >
                      <MoreVertical
                        size={24}
                        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                      />
                    </button>

                    {/* Rotating Music Disk (YouTube Style) */}
                    <div className="mt-2 h-9 w-9 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 p-1.5 animate-spin-slow border-2 border-white/20 shadow-lg">
                      <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        <Disc size={16} className="text-white/40" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
