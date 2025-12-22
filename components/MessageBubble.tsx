"use client";

import React from "react";
import { Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    time: string;
    isMe: boolean;
    status?: "sent" | "delivered" | "read";
    readTime?: string;
    image?: string;
    audio?: string;
  };
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { text, time, isMe, status, readTime } = message;

  return (
    <motion.div
      initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
        {message.image && (
          <img
            src={message.image}
            alt="Sent image"
            className="rounded-xl mb-2 max-h-60 w-full object-cover border border-white/10"
          />
        )}
        {message.audio && (
          <div className="mb-2 min-w-[200px]">
            <audio
              src={message.audio}
              controls
              className="h-10 w-full rounded-lg"
            />
          </div>
        )}
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
        <div className="mt-0.5 px-0.5 flex items-center justify-end">
          {status === "sent" ? (
            <Check size={14} className="text-muted-foreground/60" />
          ) : status === "delivered" ? (
            <CheckCheck size={14} className="text-muted-foreground/60" />
          ) : (
            <CheckCheck size={14} className="text-blue-400" />
          )}
        </div>
      )}
    </motion.div>
  );
};
