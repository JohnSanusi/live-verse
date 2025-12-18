"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Mic,
} from "lucide-react";
import { EliteBadge } from "@/components/EliteBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageBubble } from "@/components/MessageBubble";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { chats, sendMessage } = useApp();
  const { showToast, confirm } = useToast();
  const [text, setText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === chatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, isTyping]);

  useEffect(() => {
    // Simulate typing indicator when entering chat
    const timeout = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [chatId]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim()) {
      sendMessage(chatId, text);
      setText("");
    }
  };

  const handleFileAttach = () => {
    const mockFiles = [
      "Project_Specs.pdf",
      "Design_v2.fig",
      "Screenshot.png",
      "Meeting_Notes.docx",
    ];
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    sendMessage(chatId, `📎 Sent a file: ${randomFile}`);
    showToast("File attached!", "success");
  };

  const handleCall = (type: "voice" | "video") => {
    confirm({
      title: type === "voice" ? "Voice Call" : "Video Call",
      message: `Do you want to start a ${type} call with ${chat?.user.name}?`,
      confirmText: "Start Call",
      onConfirm: () => {
        showToast(`Calling ${chat?.user.name}...`, "success");
      },
    });
  };

  const handleOption = (action: string) => {
    setShowOptions(false);
    confirm({
      title: action,
      message: `Are you sure you want to ${action.toLowerCase()} with ${
        chat?.user.name
      }?`,
      confirmText: action,
      onConfirm: () => {
        showToast(`${action} successful!`, "success");
      },
    });
  };

  if (!chat) return <div className="p-4 text-center">Chat not found</div>;

  return (
    <div className="flex flex-col h-screen bg-background pb-safe">
      {/* Chat Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 -ml-2 rounded-full active-scale"
            onClick={() => router.push("/chats")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted overflow-hidden border border-border/50">
              {chat.user.avatar.length > 2 ? (
                <img
                  src={chat.user.avatar}
                  alt={chat.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold">
                  {chat.user.avatar}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-sm leading-none">
                  {chat.isGroup ? chat.groupName : chat.user.name}
                </h3>
                {!chat.isGroup && chat.user.isVerified && (
                  <EliteBadge size={14} />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  !chat.isGroup && chat.user.status === "online"
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
              >
                {chat.isGroup
                  ? `${chat.members?.length || 0} members`
                  : chat.user.status === "online"
                  ? "Online"
                  : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full active-scale"
            onClick={() => handleCall("voice")}
          >
            <Phone size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full active-scale"
            onClick={() => handleCall("video")}
          >
            <Video size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full active-scale"
            onClick={() => setShowOptions(!showOptions)}
          >
            <MoreVertical size={18} />
          </Button>

          {showOptions && (
            <div className="absolute top-12 right-0 w-48 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors"
                onClick={() => handleOption("Clear Chat")}
              >
                Clear Chat
              </button>
              <button
                className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors"
                onClick={() => handleOption("Mute Notifications")}
              >
                Mute Notifications
              </button>
              <button
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={() => handleOption("Block User")}
              >
                Block User
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-2 py-1 select-none"
          >
            <div className="flex gap-1 h-4 items-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-1 h-1 rounded-full bg-primary/40"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-1 h-1 rounded-full bg-primary/60"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                className="w-1 h-1 rounded-full bg-primary"
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 animate-pulse">
              {chat.isGroup
                ? "Someone is typing..."
                : `${chat.user.name} is typing...`}
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-background/80 backdrop-blur-lg">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full text-muted-foreground hover:text-primary active-scale"
            onClick={handleFileAttach}
          >
            <Paperclip size={20} />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              className="pr-10 rounded-full border-none bg-secondary/50 focus-visible:ring-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-primary active-scale"
              onClick={() => {
                sendMessage(chatId, "🎤 [Voice Message] (0:15)");
                showToast("Voice message sent!", "success");
              }}
            >
              <Mic size={18} />
            </Button>
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-10 w-10 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active-scale"
          >
            <Send size={18} className="ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
