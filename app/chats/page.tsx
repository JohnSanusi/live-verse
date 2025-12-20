"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatListItem } from "@/components/ChatListItem";
import { Search, Edit, Archive, FolderArchive } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

export default function ChatsPage() {
  const {
    chats,
    users,
    followers,
    following,
    addContact,
    createChat,
    toggleArchiveChat,
    createGroupChat,
    fetchFollowLists,
  } = useApp();
  const { showToast } = useToast();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "archived">("all");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (showContacts) {
      fetchFollowLists();
    }
  }, [showContacts, fetchFollowLists]);

  const handleStartChat = async (userId: string) => {
    const chatId = await createChat(userId);
    if (chatId) {
      router.push(`/chats/${chatId}`);
      setShowContacts(false);
    } else {
      showToast("Failed to start chat", "error");
    }
  };

  const filteredChats = chats.filter((chat) => {
    const name = chat.isGroup ? chat.groupName : chat.user?.name;
    const matchesSearch =
      name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch && !chat.isArchived;
    return matchesSearch && chat.isArchived;
  });

  const allContacts = [
    ...followers.map((f) => ({ ...f, type: "Follower" })),
    ...following.map((f) => ({ ...f, type: "Following" })),
  ].filter(
    (c, index, self) => index === self.findIndex((t) => t.id === c.id) // Remove duplicates
  );

  const filteredContacts = allContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.handle.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      showToast("Group name and members required", "error");
      return;
    }
    createGroupChat(groupName, selectedMembers);
    setIsCreatingGroup(false);
    setGroupName("");
    setSelectedMembers([]);
    setShowContacts(false);
    showToast("Group created!", "success");
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="pb-20 h-screen flex flex-col relative overflow-hidden bg-background">
      <Header
        title="Messages"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full bg-secondary/30 hover:bg-secondary active-scale"
            onClick={() => setShowContacts(!showContacts)}
          >
            <Edit size={20} />
          </Button>
        }
      />

      {/* Contacts Popup */}
      <AnimatePresence>
        {showContacts && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-16 left-0 right-0 z-50 bg-background border-b border-border p-4 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {isCreatingGroup ? "New Group" : "Compose"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-xs font-bold rounded-full active-scale"
                onClick={() => setIsCreatingGroup(!isCreatingGroup)}
              >
                {isCreatingGroup ? "Cancel" : "Create Group"}
              </Button>
            </div>

            <div className="mb-4">
              <Input
                placeholder="Search followers or following..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="bg-secondary/30 h-10 rounded-xl border-none focus:ring-1 focus:ring-primary/30 text-sm"
              />
            </div>

            {isCreatingGroup && (
              <div className="mb-4 space-y-3">
                <Input
                  placeholder="What's the group called?"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-secondary/30 h-12 rounded-2xl border-none focus:ring-1 focus:ring-primary/30"
                />
                <Button
                  className="w-full h-12 rounded-2xl font-bold active-scale transition-all"
                  onClick={handleCreateGroup}
                  disabled={!groupName || selectedMembers.length === 0}
                >
                  Create Group ({selectedMembers.length})
                </Button>
              </div>
            )}

            <div className="space-y-1 overflow-y-auto pr-1 flex-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-secondary/30 rounded-2xl group transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 overflow-hidden">
                        {user.avatar.length > 2 ? (
                          <img
                            src={user.avatar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name[0]
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{user.name}</p>
                          <span className="text-[8px] bg-secondary/50 px-1.5 py-0.5 rounded text-muted-foreground font-black uppercase tracking-tighter">
                            {user.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          @{user.handle}
                        </p>
                      </div>
                    </div>
                    {isCreatingGroup ? (
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user.id)}
                        onChange={() => toggleMember(user.id)}
                        className="h-5 w-5 rounded-full border-2 border-border text-primary focus:ring-primary checked:bg-primary transition-all cursor-pointer shadow-sm"
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        className="h-8 px-4 text-xs rounded-full active-scale"
                        onClick={() => handleStartChat(user.id)}
                      >
                        Chat
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground italic text-xs">
                  No matches in your circles
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4 bg-background/80 backdrop-blur-md sticky top-16 z-10 border-b border-border/50">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
            size={18}
          />
          <Input
            placeholder="Search conversations..."
            className="pl-12 h-12 bg-secondary/30 border-none rounded-2xl focus:ring-1 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex p-1 bg-secondary/30 rounded-2xl">
          {(["all", "archived"] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                activeTab === tab
                  ? "bg-background shadow-lg text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {filteredChats.map((chat) => (
          <motion.div key={chat.id} layout className="relative">
            {/* Background Action (shows on drag, mobile only) */}
            <div
              className={`absolute inset-0 rounded-3xl flex lg:hidden items-center justify-end px-8 transition-colors ${
                chat.isArchived ? "bg-blue-500" : "bg-primary"
              }`}
            >
              {chat.isArchived ? (
                <FolderArchive size={24} className="text-white" />
              ) : (
                <Archive size={24} className="text-white" />
              )}
            </div>

            <motion.div
              drag={isMobile ? "x" : false}
              dragConstraints={{ left: -100, right: 0 }}
              dragElastic={{ left: 0.1, right: 0 }}
              onDragEnd={(e, info) => {
                if (isMobile && info.offset.x < -80) {
                  toggleArchiveChat(chat.id);
                  showToast(
                    chat.isArchived ? "Unarchived" : "Archived",
                    "info"
                  );
                }
              }}
              className={`relative z-10 bg-background transition-transform ${
                isMobile
                  ? "active:scale-[0.98] cursor-grab active:cursor-grabbing"
                  : ""
              }`}
            >
              <ChatListItem
                {...chat}
                user={{
                  name: chat.isGroup
                    ? chat.groupName || "Group"
                    : chat.user?.name || "Unknown",
                  avatar: chat.isGroup
                    ? chat.groupAvatar || ""
                    : chat.user?.avatar || "",
                  status: chat.isGroup
                    ? "online"
                    : chat.user?.status || "offline",
                  isVerified: !chat.isGroup && chat.user?.isVerified,
                }}
                isArchived={chat.isArchived}
                onArchive={() => {
                  toggleArchiveChat(chat.id);
                  showToast(
                    chat.isArchived ? "Unarchived" : "Archived",
                    "info"
                  );
                }}
              />
            </motion.div>
          </motion.div>
        ))}

        {filteredChats.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-20 flex flex-col items-center gap-4"
          >
            <FolderArchive size={48} className="opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">
              {activeTab === "archived"
                ? "Vault is empty"
                : "No frequencies detected"}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
