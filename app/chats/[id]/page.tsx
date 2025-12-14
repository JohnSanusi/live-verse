"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageBubble } from "@/components/MessageBubble";
import { useApp } from "@/context/AppContext";

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { chats, sendMessage } = useApp();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === chatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim()) {
      sendMessage(chatId, text);
      setText("");
    }
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
            className="h-8 w-8 p-0 -ml-2 rounded-full"
            onClick={() => router.push('/chats')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted overflow-hidden">
               {chat.user.avatar.length > 2 ? (
                 <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold">
                   {chat.user.avatar}
                 </div>
               )}
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-none">{chat.user.name}</h3>
              <span className={`text-[10px] font-medium ${chat.user.status === 'online' ? 'text-green-500' : 'text-muted-foreground'}`}>
                {chat.user.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
            <Video size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
            <MoreVertical size={18} />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4">
        {chat.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-background/80 backdrop-blur-lg">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full text-muted-foreground hover:text-primary">
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
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-primary"
            >
              <Mic size={18} />
            </Button>
          </div>
          <Button type="submit" size="sm" className="h-10 w-10 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Send size={18} className="ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
