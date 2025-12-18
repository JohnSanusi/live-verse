"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Heart,
  Send,
} from "lucide-react";
import { Status, useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";

interface StatusViewerProps {
  statuses: Status[];
  initialIndex: number;
  onClose: () => void;
}

export const StatusViewer = ({
  statuses,
  initialIndex,
  onClose,
}: StatusViewerProps) => {
  const { markStatusAsSeen, toggleStatusLike, replyToStatus, currentUser } =
    useApp();
  const [currentStatusIndex, setCurrentStatusIndex] = useState(initialIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");

  const currentStatus = statuses[currentStatusIndex];
  const currentItem = currentStatus.items[currentItemIndex];

  const handleNext = useCallback(() => {
    if (currentItemIndex < currentStatus.items.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentStatusIndex < statuses.length - 1) {
      setCurrentStatusIndex((prev) => prev + 1);
      setCurrentItemIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [
    currentItemIndex,
    currentStatus.items.length,
    currentStatusIndex,
    statuses.length,
    onClose,
  ]);

  const handlePrev = useCallback(() => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentStatusIndex > 0) {
      setCurrentStatusIndex((prev) => prev - 1);
      setCurrentItemIndex(statuses[currentStatusIndex - 1].items.length - 1);
      setProgress(0);
    }
  }, [currentItemIndex, currentStatusIndex, statuses]);

  useEffect(() => {
    markStatusAsSeen(currentStatus.id);
  }, [currentStatus.id, markStatusAsSeen]);

  useEffect(() => {
    const duration = currentItem.duration || 5000;
    const interval = 100;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [currentItem, handleNext]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      replyToStatus(currentStatus.id, replyText);
      setReplyText("");
    }
  };

  const isLiked = currentStatus.likes?.includes(currentUser.id);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-50 flex gap-1">
        {currentStatus.items.map((_, index) => (
          <div
            key={index}
            className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden"
          >
            <div
              className={`h-full bg-white transition-all duration-100 ease-linear ${
                index === currentItemIndex ? "" : "duration-0"
              }`}
              style={{
                width: `${
                  index < currentItemIndex
                    ? 100
                    : index === currentItemIndex
                    ? progress
                    : 0
                }%`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-white/20 overflow-hidden bg-muted">
            {currentStatus.user.avatar.length > 2 ? (
              <img
                src={currentStatus.user.avatar}
                alt={currentStatus.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {currentStatus.user.name[0]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-white font-bold text-sm">
                {currentStatus.user.name}
              </p>
              {currentStatus.user.isVerified && (
                <BadgeCheck size={14} className="text-blue-500 fill-blue-500" />
              )}
            </div>
            <p className="text-white/60 text-[10px] sm:text-xs">
              {currentItemIndex + 1} of {currentStatus.items.length} •{" "}
              {currentItem.content || "Just now"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white h-10 w-10 p-0 rounded-full hover:bg-white/10"
          onClick={onClose}
        >
          <X size={24} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex items-center justify-center select-none overflow-hidden">
        {currentItem.type === "image" ? (
          <img
            src={currentItem.url}
            alt="Status"
            className="w-full max-h-screen object-contain"
          />
        ) : (
          <video
            src={currentItem.url}
            autoPlay
            muted
            playsInline
            className="w-full max-h-screen object-contain"
          />
        )}

        {/* Navigation Overlays */}
        <div
          className="absolute inset-y-0 left-0 w-1/3 z-20"
          onClick={handlePrev}
        />
        <div
          className="absolute inset-y-0 right-0 w-2/3 z-20"
          onClick={handleNext}
        />
      </div>

      {/* Footer Actions */}
      <div className="p-4 pb-8 sm:pb-4 z-50 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-3 max-w-lg mx-auto w-full">
          <form className="flex-1 relative" onSubmit={handleReply}>
            <input
              type="text"
              placeholder="Reply..."
              className="w-full h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            {replyText.trim() && (
              <button
                type="submit"
                className="absolute right-2 top-2 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center active-scale"
              >
                <Send size={16} />
              </button>
            )}
          </form>
          <button
            className={`flex flex-col items-center justify-center transition-transform active:scale-75 ${
              isLiked ? "text-red-500" : "text-white"
            }`}
            onClick={() => toggleStatusLike(currentStatus.id)}
          >
            <Heart size={28} className={isLiked ? "fill-current" : ""} />
            {currentStatus.likes && currentStatus.likes.length > 0 && (
              <span className="text-[10px] font-bold mt-0.5">
                {currentStatus.likes.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
