"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ChatListItem } from "@/components/ChatListItem";
import { Search, Edit, Archive, FolderArchive } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/context/AppContext";

export default function ChatsPage() {
  const { chats, users, addContact, toggleArchiveChat, createGroupChat } =
    useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "archived">("all");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      (chat.isGroup ? chat.groupName : chat.user.name)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch && !chat.isArchived;
    return matchesSearch && chat.isArchived;
  });

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert("Please provide a group name and select at least one member.");
      return;
    }
    createGroupChat(groupName, selectedMembers);
    setIsCreatingGroup(false);
    setGroupName("");
    setSelectedMembers([]);
    setShowContacts(false);
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="pb-20 h-screen flex flex-col relative">
      <Header
        title="Messages"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full active-scale"
            onClick={() => setShowContacts(!showContacts)}
          >
            <Edit size={20} />
          </Button>
        }
      />

      {showContacts && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-background border-b border-border p-4 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              {isCreatingGroup ? "Create Group" : "New Chat / Add Contact"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs font-bold"
              onClick={() => setIsCreatingGroup(!isCreatingGroup)}
            >
              {isCreatingGroup ? "Cancel Group" : "New Group"}
            </Button>
          </div>

          {isCreatingGroup && (
            <div className="mb-4 space-y-2">
              <Input
                placeholder="Group Name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-secondary/30"
              />
              <Button
                className="w-full h-9 rounded-xl font-bold"
                onClick={handleCreateGroup}
              >
                Create Group ({selectedMembers.length} selected)
              </Button>
            </div>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-bold text-primary border border-border/50">
                    {user.avatar.length > 2 ? (
                      <img
                        src={user.avatar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name[0]
                    )}
                  </div>
                  <span className="font-medium text-sm">{user.name}</span>
                </div>
                {isCreatingGroup ? (
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => toggleMember(user.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      addContact(user);
                      alert(`Added ${user.name} to contacts!`);
                      setShowContacts(false);
                    }}
                  >
                    Chat
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search chats..."
            className="pl-10 bg-secondary/50 border-none rounded-2xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex p-1 bg-secondary/30 rounded-2xl">
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "all"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Chats
          </button>
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "archived"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("archived")}
          >
            Archived
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-2">
        {filteredChats.map((chat) => (
          <div key={chat.id} className="relative group">
            <ChatListItem
              {...chat}
              user={{ ...chat.user, status: chat.user.status || "offline" }}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary/80 backdrop-blur-sm p-2 rounded-full border border-border shadow-sm active-scale"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleArchiveChat(chat.id);
              }}
              title={chat.isArchived ? "Unarchive" : "Archive"}
            >
              {chat.isArchived ? (
                <FolderArchive size={14} className="text-primary" />
              ) : (
                <Archive size={14} className="text-foreground" />
              )}
            </button>
          </div>
        ))}
        {filteredChats.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            {activeTab === "archived" ? "No archived chats" : "No chats found"}
          </div>
        )}
      </main>
    </div>
  );
}
