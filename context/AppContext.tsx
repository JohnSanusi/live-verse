"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// --- Types ---
export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  status: "online" | "offline" | "away";
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  time: string;
}

export interface FeedPost {
  id: number;
  user: User;
  content: {
    text: string;
    image?: string;
  };
  stats: {
    likes: number;
    comments: number;
  };
  liked: boolean;
  commentsList: Comment[];
}

export interface Message {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface Chat {
  id: string;
  user: User;
  messages: Message[];
  lastMessage: {
    text: string;
    time: string;
    unread?: number;
  };
}

export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "document" | "image";
  size?: string;
  items?: number;
  date: string;
}

interface AppContextType {
  currentUser: User;
  updateProfile: (data: Partial<User>) => void;
  
  feeds: FeedPost[];
  toggleLike: (id: number) => void;
  addComment: (postId: number, text: string) => void;
  
  chats: Chat[];
  sendMessage: (chatId: string, text: string) => void;
  
  files: FileItem[];
  addFile: () => void; // Mock upload
}

// --- Mock Data Generators ---
const MOCK_USER: User = {
  id: "me",
  name: "Zen Master",
  handle: "zen_master",
  avatar: "Z",
  bio: "Digital explorer & code artisan. Building the future of messaging with Live-Verse. 🚀 #coding #react #nextjs",
  status: "online",
  stats: { posts: 42, followers: 1250, following: 340 },
};

const INITIAL_FEEDS: FeedPost[] = [
  {
    id: 1,
    user: { ...MOCK_USER, id: "u1", name: "Alex Johnson", avatar: "A", handle: "alex_j" },
    content: {
      text: "Just finished the new design for the project! 🎨 What do you guys think? #design #uiux",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
    },
    stats: { likes: 24, comments: 2 },
    liked: false,
    commentsList: [
        { id: "c1", user: { ...MOCK_USER, name: "Sarah", avatar: "S" }, text: "Looks amazing!", time: "1h ago" },
        { id: "c2", user: { ...MOCK_USER, name: "Mike", avatar: "M" }, text: "Great work!", time: "30m ago" }
    ],
  },
  {
    id: 2,
    user: { ...MOCK_USER, id: "u2", name: "Sarah Williams", avatar: "S", handle: "sarah_w" },
    content: {
      text: "Working on the backend integration. It's coming along nicely! 🚀",
    },
    stats: { likes: 12, comments: 0 },
    liked: true,
    commentsList: [],
  },
  {
    id: 3,
    user: { ...MOCK_USER, id: "u3", name: "Mike Chen", avatar: "M", handle: "mike_c" },
    content: {
      text: "Anyone up for a quick sync later today? Need to discuss the roadmap.",
    },
    stats: { likes: 8, comments: 1 },
    liked: false,
    commentsList: [
        { id: "c3", user: { ...MOCK_USER, name: "Alex", avatar: "A" }, text: "I'm free at 2pm.", time: "10m ago" }
    ],
  },
];

const INITIAL_CHATS: Chat[] = [
  {
    id: "1",
    user: { ...MOCK_USER, id: "u1", name: "Alex Johnson", avatar: "A", status: "online" },
    messages: [
        { id: "m1", text: "Hey! How's the project coming along?", time: "10:30 AM", isMe: false },
        { id: "m2", text: "It's going great! Just finishing up the frontend.", time: "10:32 AM", isMe: true },
        { id: "m3", text: "That's awesome. Can't wait to see it.", time: "10:33 AM", isMe: false },
    ],
    lastMessage: { text: "That's awesome. Can't wait to see it.", time: "10:33 AM", unread: 1 },
  },
  {
    id: "2",
    user: { ...MOCK_USER, id: "u2", name: "Sarah Williams", avatar: "S", status: "offline" },
    messages: [
        { id: "m1", text: "I'll send the files over shortly.", time: "1h ago", isMe: false },
    ],
    lastMessage: { text: "I'll send the files over shortly.", time: "1h ago" },
  },
];

const INITIAL_FILES: FileItem[] = [
  { id: "1", name: "Project Assets", type: "folder", items: 12, date: "Oct 24" },
  { id: "2", name: "Documents", type: "folder", items: 8, date: "Oct 22" },
  { id: "3", name: "Design_Mockup_v2.png", type: "image", size: "2.4 MB", date: "Yesterday" },
  { id: "4", name: "Project_Proposal.pdf", type: "document", size: "1.8 MB", date: "Oct 20" },
];

// --- Context ---
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [feeds, setFeeds] = useState<FeedPost[]>(INITIAL_FEEDS);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);

  const updateProfile = (data: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  const toggleLike = (id: number) => {
    setFeeds((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              stats: { ...post.stats, likes: post.liked ? post.stats.likes - 1 : post.stats.likes + 1 },
            }
          : post
      )
    );
  };

  const addComment = (postId: number, text: string) => {
    setFeeds((prev) =>
        prev.map((post) => {
            if (post.id === postId) {
                const newComment: Comment = {
                    id: Date.now().toString(),
                    user: currentUser,
                    text,
                    time: "Just now"
                };
                return {
                    ...post,
                    stats: { ...post.stats, comments: post.stats.comments + 1 },
                    commentsList: [...post.commentsList, newComment]
                };
            }
            return post;
        })
    );
  };

  const sendMessage = (chatId: string, text: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          const newMessage: Message = {
            id: Date.now().toString(),
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
          };
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: { text, time: "Just now", unread: 0 },
          };
        }
        return chat;
      })
    );
  };

  const addFile = () => {
    const newFile: FileItem = {
        id: Date.now().toString(),
        name: `New_Upload_${Math.floor(Math.random() * 1000)}.jpg`,
        type: "image",
        size: "1.2 MB",
        date: "Just now"
    };
    setFiles((prev) => [newFile, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        updateProfile,
        feeds,
        toggleLike,
        addComment,
        chats,
        sendMessage,
        files,
        addFile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
