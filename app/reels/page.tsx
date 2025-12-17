"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Heart, MessageCircle, Share2, Play, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_REELS = [
  {
    id: 1,
    user: { id: "1", name: "Alex Johnson", avatar: "A", handle: "@alex_j" },
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    caption: "Check out this amazing view! 🌅 #nature #sunset",
    stats: { likes: 1240, comments: 89, shares: 45 },
  },
  {
    id: 2,
    user: { id: "2", name: "Sarah Williams", avatar: "S", handle: "@sarah_w" },
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    caption: "New design process walkthrough 🎨",
    stats: { likes: 890, comments: 56, shares: 23 },
  },
  {
    id: 3,
    user: { id: "3", name: "Mike Chen", avatar: "M", handle: "@mike_c" },
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    caption: "Coding tips and tricks! 💻 #webdev",
    stats: { likes: 2100, comments: 145, shares: 78 },
  },
];

export default function ReelsPage() {
  const [showCreateReel, setShowCreateReel] = useState(false);
  const [reelCaption, setReelCaption] = useState("");
  const [reelVideo, setReelVideo] = useState("");
  const [likedReels, setLikedReels] = useState<number[]>([]);
  const [showHeart, setShowHeart] = useState<number | null>(null);

  const { createReel } = useApp();
  const { showToast } = useToast();

  const handleCreateReel = () => {
    if (reelCaption.trim() && reelVideo.trim()) {
      createReel(reelCaption, reelVideo);
      setReelCaption("");
      setReelVideo("");
      setShowCreateReel(false);
      showToast("Reel created successfully!", "success");
    }
  };

  const handleAction = (action: string) => {
    showToast(`${action}!`, "success");
  };

  const handleDoubleTap = (id: number) => {
    if (!likedReels.includes(id)) {
      setLikedReels((prev) => [...prev, id]);
    }
    setShowHeart(id);
    setTimeout(() => setShowHeart(null), 1000);
  };

  const toggleLike = (id: number) => {
    setLikedReels((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      <Header
        title="Reels"
        className="bg-transparent border-none text-white absolute top-0 left-0 right-0 z-50 pointer-events-none"
      />

      {/* Create Reel Button */}
      <Button
        className="fixed top-20 right-4 z-50 h-14 w-14 rounded-[2rem] bg-white text-black shadow-2xl active-scale transition-all hover:scale-110"
        onClick={() => setShowCreateReel(true)}
      >
        <Plus size={28} />
      </Button>

      {/* Create Reel Modal */}
      <AnimatePresence>
        {showCreateReel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background border border-border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl"
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
                      Select Vision File
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
                  placeholder="Caption your frequency..."
                  className="w-full bg-secondary/30 border-none rounded-2xl p-4 min-h-[120px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm font-medium"
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                />

                <Button
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] active-scale shadow-lg shadow-primary/20"
                  onClick={handleCreateReel}
                  disabled={!reelCaption.trim() || !reelVideo.trim()}
                >
                  Transmit Reel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {MOCK_REELS.map((reel) => (
          <div
            key={reel.id}
            className="h-full w-full snap-start snap-always relative flex items-center justify-center bg-black group/reel"
            onDoubleClick={() => handleDoubleTap(reel.id)}
          >
            {/* Mock Video Container */}
            <div className="relative w-full h-full max-w-[450px] mx-auto bg-neutral-900 overflow-hidden sm:rounded-[3rem] sm:my-4 sm:h-[calc(100%-2rem)] border border-white/5">
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

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 pb-28 sm:pb-12 z-20">
                <div className="flex items-end justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${reel.user.id}`}
                        className="flex items-center gap-3 active-scale"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg">
                          <div className="h-full w-full rounded-[0.9rem] bg-black overflow-hidden flex items-center justify-center text-white font-black text-lg border border-white/10">
                            {reel.user.avatar}
                          </div>
                        </div>
                        <div>
                          <p className="font-black text-white tracking-tight">
                            {reel.user.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">
                            {reel.user.handle}
                          </p>
                        </div>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 text-xs font-black uppercase tracking-wider active-scale"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction("Following");
                        }}
                      >
                        Follow
                      </Button>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed line-clamp-2 drop-shadow-sm font-medium">
                      {reel.caption}
                    </p>
                  </div>

                  {/* Sidebar Actions */}
                  <div className="flex flex-col gap-6 items-center">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        className={`h-14 w-14 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-75 ${
                          likedReels.includes(reel.id)
                            ? "text-red-500 bg-red-500/10"
                            : "text-white"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(reel.id);
                        }}
                      >
                        <Heart
                          size={28}
                          className={
                            likedReels.includes(reel.id) ? "fill-current" : ""
                          }
                        />
                      </button>
                      <span className="text-[10px] font-black tracking-tighter text-white/80">
                        {reel.stats.likes +
                          (likedReels.includes(reel.id) ? 1 : 0)}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        className="h-14 w-14 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 text-white transition-all active:scale-75"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction("Comments");
                        }}
                      >
                        <MessageCircle size={28} />
                      </button>
                      <span className="text-[10px] font-black tracking-tighter text-white/80">
                        {reel.stats.comments}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        className="h-14 w-14 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 text-white transition-all active:scale-75"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction("Shared");
                        }}
                      >
                        <Share2 size={28} />
                      </button>
                      <span className="text-[10px] font-black tracking-tighter text-white/80">
                        {reel.stats.shares}
                      </span>
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
