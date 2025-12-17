"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Heart, MessageCircle, Share2, Play, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

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
  const [currentReel, setCurrentReel] = useState(0);
  const [showCreateReel, setShowCreateReel] = useState(false);
  const [reelCaption, setReelCaption] = useState("");
  const [reelVideo, setReelVideo] = useState("");
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

  return (
    <>
      {/* Create Reel Button */}
      <Button
        className="fixed top-4 right-4 z-20 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
        onClick={() => setShowCreateReel(true)}
      >
        <Plus size={24} />
      </Button>

      {/* Create Reel Modal */}
      {showCreateReel && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Reel</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowCreateReel(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
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
              <Button
                variant="secondary"
                className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() =>
                  document.getElementById("reel-video-upload")?.click()
                }
              >
                <Play size={32} className="text-muted-foreground" />
                <span className="text-sm font-medium">
                  Click to upload Video
                </span>
              </Button>

              {reelVideo && (
                <div className="relative aspect-[9/16] max-h-48 mx-auto rounded-xl overflow-hidden bg-muted border border-border group">
                  <video
                    src={reelVideo}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <button
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setReelVideo("")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <textarea
                placeholder="Caption..."
                className="w-full bg-secondary/50 border border-border rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={reelCaption}
                onChange={(e) => setReelCaption(e.target.value)}
              />

              <Button
                className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold active-scale"
                onClick={handleCreateReel}
                disabled={!reelCaption.trim() || !reelVideo.trim()}
              >
                Create Reel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide">
        {MOCK_REELS.map((reel, index) => (
          <div
            key={reel.id}
            className="h-screen w-full snap-start snap-always relative flex items-center justify-center bg-black"
          >
            {/* Video Container - Centered */}
            <div className="relative w-full h-full max-w-md mx-auto bg-neutral-900 flex items-center justify-center">
              <Play size={64} className="text-primary opacity-50" />
              <p className="absolute bottom-1/3 text-sm text-muted-foreground">
                Mock Video Player
              </p>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 md:pb-6 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <div className="max-w-md mx-auto">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${reel.user.id}`}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity active-scale"
                      >
                        <div className="h-11 w-11 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center text-primary font-bold border-2 border-primary/30">
                          {reel.user.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-white text-base leading-none">
                            {reel.user.name}
                          </p>
                          <p className="text-xs text-white/60 mt-1">
                            {reel.user.handle}
                          </p>
                        </div>
                      </Link>
                      <Button
                        size="sm"
                        className="h-8 px-4 rounded-full bg-primary text-primary-foreground font-bold text-xs active-scale"
                        onClick={() => handleAction("Following")}
                      >
                        Follow
                      </Button>
                    </div>
                    <p className="text-white text-sm leading-relaxed line-clamp-2 drop-shadow-md">
                      {reel.caption}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-6 items-center">
                    <button
                      className="flex flex-col items-center gap-1 group active-scale"
                      onClick={() => handleAction("Liked")}
                    >
                      <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-active:bg-primary/20 transition-colors">
                        <Heart
                          size={28}
                          className="text-white group-active:text-primary transition-colors"
                        />
                      </div>
                      <span className="text-xs font-bold text-white drop-shadow-md">
                        {reel.stats.likes}
                      </span>
                    </button>
                    <button
                      className="flex flex-col items-center gap-1 group active-scale"
                      onClick={() => handleAction("Opening comments")}
                    >
                      <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-active:bg-primary/20 transition-colors">
                        <MessageCircle
                          size={28}
                          className="text-white group-active:text-primary transition-colors"
                        />
                      </div>
                      <span className="text-xs font-bold text-white drop-shadow-md">
                        {reel.stats.comments}
                      </span>
                    </button>
                    <button
                      className="flex flex-col items-center gap-1 group active-scale"
                      onClick={() => handleAction("Link copied")}
                    >
                      <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-active:bg-primary/20 transition-colors">
                        <Share2
                          size={28}
                          className="text-white group-active:text-primary transition-colors"
                        />
                      </div>
                      <span className="text-xs font-bold text-white drop-shadow-md">
                        {reel.stats.shares}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
