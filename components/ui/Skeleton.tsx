"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "rectangle" | "circle" | "text";
}

export const Skeleton = ({
  className,
  variant = "rectangle",
}: SkeletonProps) => {
  const borderRadius = variant === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div
      className={`relative overflow-hidden bg-muted/20 ${borderRadius} ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
      />
    </div>
  );
};

export const PostSkeleton = () => (
  <div className="bg-card border-b border-border p-4 space-y-4">
    <div className="flex gap-3">
      <Skeleton variant="circle" className="h-10 w-10 flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="h-4 w-1/3" />
        <Skeleton variant="text" className="h-3 w-1/4 opacity-50" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-[90%]" />
    </div>
    <Skeleton className="aspect-video w-full rounded-[2rem]" />
    <div className="flex gap-4">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export const StatusSkeleton = () => (
  <div className="flex flex-col items-center gap-1 min-w-[70px]">
    <Skeleton
      variant="circle"
      className="h-16 w-16 border-2 border-muted/20 p-1"
    />
    <Skeleton variant="text" className="h-3 w-12" />
  </div>
);
