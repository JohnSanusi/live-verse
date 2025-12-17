"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
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
  const [currentStatusIndex, setCurrentStatusIndex] = useState(initialIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { markStatusAsSeen } = useApp();

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
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 100 / (currentItem.duration / 100);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentItem, handleNext]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
        {currentStatus.items.map((_, index) => (
          <div
            key={index}
            className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
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
      <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden border border-white/20">
            {currentStatus.user.avatar.length > 2 ? (
              <img
                src={currentStatus.user.avatar}
                alt={currentStatus.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {currentStatus.user.avatar}
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
            <p className="text-white/60 text-[10px]">Just now</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white h-10 w-10 p-0 rounded-full"
          onClick={onClose}
        >
          <X size={24} />
        </Button>
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {currentItem.type === "image" ? (
          <img
            src={currentItem.url}
            alt="Status"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            src={currentItem.url}
            autoPlay
            muted
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>
      </div>

      {/* Controls (Desktop) */}
      <div className="hidden md:flex absolute inset-y-0 left-4 items-center">
        <Button
          variant="ghost"
          className="text-white/50 hover:text-white"
          onClick={handlePrev}
        >
          <ChevronLeft size={48} />
        </Button>
      </div>
      <div className="hidden md:flex absolute inset-y-0 right-4 items-center">
        <Button
          variant="ghost"
          className="text-white/50 hover:text-white"
          onClick={handleNext}
        >
          <ChevronRight size={48} />
        </Button>
      </div>
    </div>
  );
};
