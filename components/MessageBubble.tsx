"use client";

import React from "react";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    time: string;
    isMe: boolean;
    status?: "sent" | "delivered" | "read";
    readTime?: string;
  };
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { text, time, isMe, status, readTime } = message;

  return (
    <div
      className={`flex flex-col w-full ${
        isMe ? "items-end" : "items-start"
      } mb-4`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isMe
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-secondary text-secondary-foreground rounded-bl-none"
        }`}
      >
        <p className="text-sm">{text}</p>
        <p
          className={`text-[10px] mt-1 text-right ${
            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {time}
        </p>
      </div>
      {isMe && status && (
        <div className="mt-0.5 px-1 flex items-center justify-end gap-1">
          {status === "sent" ? (
            <Check size={14} className="text-muted-foreground" />
          ) : status === "delivered" ? (
            <CheckCheck size={14} className="text-muted-foreground" />
          ) : (
            <CheckCheck size={14} className="text-blue-500" />
          )}
          {status === "read" && readTime && (
            <span className="text-[9px] text-muted-foreground">
              Read {readTime}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
