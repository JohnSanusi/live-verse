"use client";

import React from "react";

interface EliteBadgeProps {
  size?: number;
  className?: string;
}

export const EliteBadge = ({ size = 16, className = "" }: EliteBadgeProps) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
      >
        <defs>
          <linearGradient
            id="badgeGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        {/* Elite Star-burst shape */}
        <path
          d="M12 2L14.1 5.5H17.5C18.3 5.5 19 6.2 19 7V10.4L22 12.5L19 14.6V18C19 18.8 18.3 19.5 17.5 19.5H14.1L12 22.5L9.9 19.5H6.5C5.7 19.5 5 18.8 5 18V14.6L2 12.5L5 10.4V7C5 6.2 5.7 5.5 6.5 5.5H9.9L12 2Z"
          fill="url(#badgeGradient)"
        />
        <path
          d="M8.5 12.5L11 15L16 10"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
