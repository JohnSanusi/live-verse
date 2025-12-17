import React from "react";

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
        <div className="mt-1 px-1">
          <p className="text-[10px] font-medium text-muted-foreground">
            {status === "read"
              ? `Read ${readTime || ""}`
              : status === "delivered"
              ? "Delivered"
              : "Sent"}
          </p>
        </div>
      )}
    </div>
  );
};
