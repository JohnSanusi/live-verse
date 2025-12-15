"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Heart, MessageCircle, Share2, Play, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

const MOCK_REELS = [
  {
    id: 1,
    user: { id: "1", name: "Alex Johnson", avatar: "A", handle: "@alex_j" },
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    caption: "Check out this amazing view! 🌅 #nature #sunset",
    stats: { likes: 1240, comments: 89, shares: 45 },
  },
  {
    id: 2,
    user: { id: "2", name: "Sarah Williams", avatar: "S", handle: "@sarah_w" },
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    caption: "New design process walkthrough 🎨",
    stats: { likes: 890, comments: 56, shares: 23 },
  },
  {
    id: 3,
    user: { id: "3", name: "Mike Chen", avatar: "M", handle: "@mike_c" },
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
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

  const handleCreateReel = () => {
    if (reelCaption.trim() && reelVideo.trim()) {
      createReel(reelCaption, reelVideo);
      setReelCaption("");
      setReelVideo("");
      setShowCreateReel(false);
      alert("Reel created successfully!");
    }
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
              <Input
                placeholder="Video URL"
                className="bg-secondary/50 border-border"
                value={reelVideo}
                onChange={(e) => setReelVideo(e.target.value)}
              />
              
              <textarea
                placeholder="Caption..."
                className="w-full bg-secondary/50 border border-border rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={reelCaption}
                onChange={(e) => setReelCaption(e.target.value)}
              />
              
              <Button 
                className="w-full bg-primary text-primary-foreground"
                onClick={handleCreateReel}
                disabled={!reelCaption.trim() || !reelVideo.trim()}
              >
                Create Reel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide scroll-smooth" style={{ scrollSnapType: 'y mandatory' }}>
        {MOCK_REELS.map((reel, index) => (
          <div
            key={reel.id}
            className="h-screen w-full snap-start snap-always relative flex items-center justify-center bg-black"
            style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          >
            {/* Video Container - Centered */}
            <div className="relative w-full h-full max-w-md mx-auto bg-neutral-900 flex items-center justify-center">
              <Play size={64} className="text-primary opacity-50" />
              <p className="absolute bottom-1/3 text-sm text-muted-foreground">Mock Video Player</p>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 md:pb-6 z-10 bg-gradient-to-t from-black via-black/60 to-transparent pt-20">
              <div className="max-w-md mx-auto">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${reel.user.id}`} className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
                      <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-primary font-bold flex-shrink-0">
                        {reel.user.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{reel.user.name}</p>
                        <p className="text-xs text-white/70 truncate">{reel.user.handle}</p>
                      </div>
                      <Button size="sm" className="ml-auto h-8 px-4 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                        Follow
                      </Button>
                    </Link>
                    <p className="text-white text-sm leading-relaxed">{reel.caption}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 flex-shrink-0">
                    <button className="flex flex-col items-center">
                      <Heart size={28} className="text-white mb-1" />
                      <span className="text-xs text-white font-medium">{reel.stats.likes}</span>
                    </button>
                    <button className="flex flex-col items-center">
                      <MessageCircle size={28} className="text-white mb-1" />
                      <span className="text-xs text-white font-medium">{reel.stats.comments}</span>
                    </button>
                    <button className="flex flex-col items-center">
                      <Share2 size={28} className="text-white mb-1" />
                      <span className="text-xs text-white font-medium">{reel.stats.shares}</span>
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
