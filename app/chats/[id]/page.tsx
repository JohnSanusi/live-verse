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
  X,
  Search,
  Users,
  Info,
  ChevronRight,
  Shield,
  Bell,
  Trash2,
  Square,
  StopCircle,
} from "lucide-react";
import { EliteBadge } from "@/components/EliteBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageBubble } from "@/components/MessageBubble";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const {
    chats,
    sendMessage,
    markChatAsRead,
    clearChat,
    typingUsers,
    setTyping,
    currentUser,
  } = useApp();
  const { showToast, confirm } = useToast();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const chat = chats.find((c) => c.id === chatId);
  const isSomeoneTyping = typingUsers[chatId];
  const [isInitializing, setIsInitializing] = useState(!chat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, isSomeoneTyping, imagePreview]);

  useEffect(() => {
    if (!chat && isInitializing) {
      // Re-fetch logic or just set initializing false after delay
      const timer = setTimeout(() => setIsInitializing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [chat, isInitializing]);

  useEffect(() => {
    markChatAsRead(chatId);

    const channel = supabase.channel(`chat_type_${chatId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        setTyping(chatId, payload.isTyping);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, markChatAsRead, setTyping]);

  const handleTyping = () => {
    const channel = supabase.channel(`chat_type_${chatId}`);
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { isTyping: true, user_id: chat?.user.id },
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channel.send({
        type: "broadcast",
        event: "typing",
        payload: { isTyping: false, user_id: chat?.user.id },
      });
    }, 3000);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() || imageFile) {
      sendMessage(chatId, text, imageFile || undefined);
      setText("");
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], "voice-note.webm", {
          type: "audio/webm",
        });

        await sendMessage(chatId, "", undefined, audioFile);
        showToast("Voice message sent!", "success");

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      showToast("Could not access microphone", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      onConfirm: async () => {
        if (action === "Clear Chat") {
          await clearChat(chatId);
          showToast("Chat cleared", "success");
        } else {
          showToast(`${action} successful!`, "success");
        }
      },
    });
  };

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-screen animate-pulse">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Loading chat...</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => router.push("/chats")}
        >
          Back to Chats
        </Button>
      </div>
    );
  }

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
            className="h-10 w-10 p-0 rounded-full active-scale"
            onClick={() => handleCall("video")}
          >
            <Video size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full active-scale"
            onClick={() => setShowInfo(true)}
          >
            <Info size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full active-scale"
            onClick={() => setShowOptions(!showOptions)}
          >
            <MoreVertical size={20} />
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

      {/* Info Panel / Sidebar (WhatsApp Style) */}
      <AnimatePresence>
        {showInfo && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowInfo(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-sm bg-background border-l border-border h-full overflow-y-auto"
            >
              <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => setShowInfo(false)}
                  >
                    <X size={20} />
                  </Button>
                  <h3 className="font-bold">Contact Info</h3>
                </div>
              </div>

              <div className="flex flex-col items-center p-8 border-b border-border bg-gradient-to-b from-secondary/30 to-transparent">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-xl mb-4 group relative">
                  {chat.isGroup ? (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-black">
                      {chat.groupName?.[0]}
                    </div>
                  ) : (chat.user.avatar || "").length > 2 ? (
                    <img
                      src={chat.user.avatar}
                      alt={chat.user.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-black">
                      {chat.user.avatar}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-black text-center">
                  {chat.isGroup ? chat.groupName : chat.user.name}
                </h2>
                <p className="text-muted-foreground text-sm font-medium">
                  {chat.isGroup
                    ? `Group • ${chat.members?.length} Members`
                    : chat.user.handle}
                </p>
              </div>

              {!chat.isGroup && (
                <div className="p-4 border-b border-border">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    About
                  </h4>
                  <p className="text-sm font-medium">
                    {chat.user.bio || "No status set"}
                  </p>
                </div>
              )}

              {chat.isGroup && (
                <div className="p-4 border-b border-border">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Description
                  </h4>
                  <p className="text-sm font-medium">
                    {chat.description || "WhatsApp group description..."}
                  </p>
                </div>
              )}

              <div className="py-2">
                {[
                  { icon: Bell, label: "Mute Notifications", right: "Never" },
                  {
                    icon: Shield,
                    label: "Encryption",
                    desc: "Messages are end-to-end encrypted",
                  },
                  { icon: Trash2, label: "Clear Chat", danger: true },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 transition-colors ${
                      item.danger ? "text-red-500" : ""
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        item.danger ? "bg-red-500/10" : "bg-primary/5 shadow-sm"
                      }`}
                    >
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-sm">{item.label}</div>
                      {item.desc && (
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {item.desc}
                        </div>
                      )}
                    </div>
                    {item.right && (
                      <div className="text-xs text-muted-foreground font-medium">
                        {item.right}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {chat.isGroup && (
                <div className="p-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                    {chat.members?.length} Participants
                  </h4>
                  <div className="space-y-4">
                    {chat.members?.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                          {member.avatar.length > 2 ? (
                            <img
                              src={member.avatar}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {member.avatar}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{member.name}</div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {member.id === currentUser.id
                              ? "You"
                              : member.handle}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isSomeoneTyping && (
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
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageSelect}
        />

        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-2 p-2 bg-secondary/30 rounded-xl border border-border flex items-center gap-2 relative group w-fit"
            >
              <img
                src={imagePreview}
                className="h-20 w-32 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg active:scale-90 transition-transform"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-11 w-11 p-0 rounded-full text-muted-foreground hover:text-primary active-scale"
            onClick={handleFileAttach}
          >
            <Paperclip size={22} />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder={isRecording ? "Recording..." : "Type a message..."}
              className={`pr-10 rounded-full border-none bg-secondary/50 focus-visible:ring-1 ${
                isRecording ? "text-red-500 font-bold" : ""
              }`}
              value={
                isRecording ? `Recording: ${formatTime(recordingTime)}` : text
              }
              readOnly={isRecording}
              onChange={(e) => {
                setText(e.target.value);
                handleTyping();
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full active-scale ${
                isRecording
                  ? "text-red-500 bg-red-500/10"
                  : "text-muted-foreground hover:text-primary"
              }`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <StopCircle size={22} className="animate-pulse" />
              ) : (
                <Mic size={22} />
              )}
            </Button>
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-11 w-11 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active-scale shadow-lg shadow-primary/20"
          >
            <Send size={22} className="ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
