"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { StatusViewer } from "./StatusViewer";
import { StatusCreator } from "./StatusCreator";
import { EliteBadge } from "./EliteBadge";

export const StatusList = () => {
  const { statuses, currentUser } = useApp();
  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number | null>(
    null
  );
  const [showCreator, setShowCreator] = useState(false);

  return (
    <div className="flex gap-4 overflow-x-auto p-4 scrollbar-hide bg-card border-b border-border">
      {/* My Status */}
      <div
        className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer active-scale"
        onClick={() => setShowCreator(true)}
      >
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-muted overflow-hidden border-2 border-background">
            {currentUser.avatar.length > 2 ? (
              <img
                src={currentUser.avatar}
                alt="Me"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                {currentUser.avatar}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background">
            <Plus size={14} strokeWidth={3} />
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">
          My Status
        </span>
      </div>

      {/* Others Statuses */}
      {statuses.map((status, index) => (
        <button
          key={status.id}
          className="flex flex-col items-center gap-1 flex-shrink-0 active-scale"
          onClick={() => setSelectedStatusIndex(index)}
        >
          <div
            className={`h-16 w-16 rounded-full p-0.5 border-2 ${
              status.isUnseen ? "border-primary" : "border-muted"
            }`}
          >
            <div className="h-full w-full rounded-full bg-muted overflow-hidden border-2 border-background">
              {status.user.avatar.length > 2 ? (
                <img
                  src={status.user.avatar}
                  alt={status.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  {status.user.avatar}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-0.5 w-16 px-1">
            <span className="text-[10px] font-medium text-foreground truncate">
              {status.user.name.split(" ")[0]}
            </span>
            {status.user.isVerified && <EliteBadge size={10} />}
          </div>
        </button>
      ))}

      {selectedStatusIndex !== null && (
        <StatusViewer
          statuses={statuses}
          initialIndex={selectedStatusIndex}
          onClose={() => setSelectedStatusIndex(null)}
        />
      )}

      {showCreator && <StatusCreator onClose={() => setShowCreator(false)} />}
    </div>
  );
};
