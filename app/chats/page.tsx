"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ChatListItem } from "@/components/ChatListItem";
import { Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/context/AppContext";

export default function ChatsPage() {
  const { chats, users, addContact } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showContacts, setShowContacts] = useState(false);

  const filteredChats = chats.filter((chat) => 
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-20 h-screen flex flex-col relative">
      <Header 
        title="Chats" 
        action={
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-full"
            onClick={() => setShowContacts(!showContacts)}
          >
            <Edit size={20} />
          </Button>
        } 
      />
      
      {showContacts && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-background border-b border-border p-4 shadow-xl animate-in slide-in-from-top-2">
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">New Chat / Add Contact</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-bold text-primary">
                                {user.avatar.length > 2 ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name[0]}
                            </div>
                            <span className="font-medium text-sm">{user.name}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => {
                            addContact(user);
                            alert(`Added ${user.name} to contacts!`);
                        }}>
                            Add
                        </Button>
                    </div>
                ))}
            </div>
        </div>
      )}
      
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search messages..." 
            className="pl-10 bg-secondary/50 border-none" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-2">
        {filteredChats.map((chat) => (
          <ChatListItem key={chat.id} {...chat} user={{...chat.user, status: chat.user.status || 'offline'}} />
        ))}
        {filteredChats.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            No chats found
          </div>
        )}
      </main>
    </div>
  );
}