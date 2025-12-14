"use client";

import React from "react";
import { Header } from "@/components/Header";
import { ChatListItem } from "@/components/ChatListItem";
import { Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/context/AppContext";

export default function ChatsPage() {
  const { chats } = useApp();

  return (
    <div className="pb-20 h-screen flex flex-col">
      <Header 
        title="Chats" 
        action={
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
            <Edit size={20} />
          </Button>
        } 
      />
      
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search messages..." className="pl-10 bg-secondary/50 border-none" />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-2">
        {chats.map((chat) => (
          <ChatListItem key={chat.id} {...chat} />
        ))}
      </main>
    </div>
  );
}