"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// --- Types ---
export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  status?: "online" | "offline" | "away";
  isFriend?: boolean;
  isVerified?: boolean;
  coverPhoto?: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  time: string;
  liked?: boolean;
}

export interface FeedPost {
  id: string;
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
  status?: "sent" | "delivered" | "read";
  readTime?: string;
}

export interface Status {
  id: string;
  user: User;
  items: {
    id: string;
    type: "image" | "video";
    url: string;
    duration: number;
    content?: string;
  }[];
  isUnseen: boolean;
  createdAt: string;
  likes?: string[];
  replies?: { userId: string; text: string; time: string }[];
}

export interface Chat {
  id: string;
  user: User; // For 1-on-1 chats, this is the other person. For groups, this can be the creator or null.
  messages: Message[];
  lastMessage: {
    text: string;
    time: string;
    unread?: number;
  };
  isArchived?: boolean;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  members?: User[];
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
  users: User[];
  feeds: FeedPost[];
  chats: Chat[];
  files: FileItem[];
  contacts: User[];
  statuses: Status[];
  isAuthenticated: boolean;
  updateProfile: (data: Partial<User>) => void;
  toggleLike: (targetId: string, targetType?: "post" | "reel") => Promise<void>;
  addComment: (feedId: string, text: string) => Promise<void>;
  toggleCommentLike: (feedId: string, commentId: string) => void;
  verifyUser: (userId: string, status: boolean) => Promise<void>;
  sendMessage: (chatId: string, text: string) => void;
  addFile: () => void;
  toggleFriend: (userId: string) => Promise<void>;
  addContact: (user: User) => void;
  markStatusAsSeen: (statusId: string) => void;
  addStatus: (text: string, media?: File | string) => Promise<void>;
  toggleStatusLike: (statusId: string) => void;
  replyToStatus: (statusId: string, text: string) => void;
  toggleArchiveChat: (chatId: string) => void;
  createGroupChat: (name: string, memberIds: string[]) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createPost: (text: string, media?: File | string) => Promise<void>;
  createReel: (caption: string, video: File | string) => Promise<void>;
  createMarketplaceItem: (
    name: string,
    price: string,
    image: File | string,
    category: string
  ) => Promise<void>;
  settings: {
    notifications: boolean;
    privacy: "public" | "private";
    darkMode: boolean;
  };
  updateSettings: (settings: Partial<AppContextType["settings"]>) => void;
  markChatAsRead: (chatId: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  uploadFile: (bucket: string, file: File) => Promise<string | null>;
  reels: any[];
  marketplaceItems: any[];
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
  isVerified: true,
};

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Alex Johnson",
    handle: "alex_j",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
    bio: "UI/UX Designer | Art Enthusiast",
    stats: { posts: 12, followers: 450, following: 210 },
    status: "online",
    isFriend: true,
    isVerified: true,
  },
  {
    id: "2",
    name: "Sarah Williams",
    handle: "sarah_w",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    bio: "Frontend Dev | Coffee Lover ☕",
    stats: { posts: 28, followers: 890, following: 400 },
    status: "offline",
    isFriend: false,
    isVerified: true,
  },
  {
    id: "3",
    name: "Mike Chen",
    handle: "mike_c",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop",
    bio: "Tech Lead | Open Source Contributor",
    stats: { posts: 54, followers: 1200, following: 560 },
    status: "away",
    isFriend: false,
    isVerified: false,
  },
];

const MOCK_FEEDS: FeedPost[] = [
  {
    id: "1",
    user: {
      ...MOCK_USER,
      id: "u1",
      name: "Alex Johnson",
      avatar: "A",
      handle: "alex_j",
    },
    content: {
      text: "Just finished the new design for the project! 🎨 What do you guys think? #design #uiux",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
    },
    stats: { likes: 24, comments: 2 },
    liked: false,
    commentsList: [
      {
        id: "c1",
        user: { ...MOCK_USER, name: "Sarah", avatar: "S" },
        text: "Looks amazing!",
        time: "1h ago",
      },
      {
        id: "c2",
        user: { ...MOCK_USER, name: "Mike", avatar: "M" },
        text: "Great work!",
        time: "30m ago",
      },
    ],
  },
  {
    id: "2",
    user: {
      ...MOCK_USER,
      id: "u2",
      name: "Sarah Williams",
      avatar: "S",
      handle: "sarah_w",
    },
    content: {
      text: "Working on the backend integration. It's coming along nicely! 🚀",
    },
    stats: { likes: 12, comments: 0 },
    liked: true,
    commentsList: [],
  },
  {
    id: "3",
    user: {
      ...MOCK_USER,
      id: "u3",
      name: "Mike Chen",
      avatar: "M",
      handle: "mike_c",
    },
    content: {
      text: "Anyone up for a quick sync later today? Need to discuss the roadmap.",
    },
    stats: { likes: 8, comments: 1 },
    liked: false,
    commentsList: [
      {
        id: "c3",
        user: { ...MOCK_USER, name: "Alex", avatar: "A" },
        text: "I'm free at 2pm.",
        time: "10m ago",
      },
    ],
  },
];

const MOCK_STATUSES: Status[] = [
  {
    id: "s1",
    user: MOCK_USERS[0],
    isUnseen: true,
    createdAt: new Date().toISOString(),
    likes: [],
    items: [
      {
        id: "si1",
        type: "image",
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        duration: 5000,
      },
    ],
  },
  {
    id: "s2",
    user: MOCK_USERS[1],
    isUnseen: false,
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    likes: [],
    items: [
      {
        id: "si2",
        type: "image",
        url: "https://images.unsplash.com/photo-1511765224389-37f0e77ee0eb?w=800&q=80",
        duration: 5000,
      },
    ],
  },
];

const MOCK_CHATS: Chat[] = [
  {
    id: "1",
    user: {
      ...MOCK_USER,
      id: "u1",
      name: "Alex Johnson",
      avatar: "A",
      status: "online",
    },
    messages: [
      {
        id: "m1",
        text: "Hey! How's the project coming along?",
        time: "10:30 AM",
        isMe: false,
      },
      {
        id: "m2",
        text: "It's going great! Just finishing up the frontend.",
        time: "10:32 AM",
        isMe: true,
        status: "read",
        readTime: "10:35 AM",
      },
      {
        id: "m3",
        text: "That's awesome. Can't wait to see it.",
        time: "10:33 AM",
        isMe: false,
      },
    ],
    lastMessage: {
      text: "That's awesome. Can't wait to see it.",
      time: "10:33 AM",
      unread: 1,
    },
  },
  {
    id: "2",
    user: {
      ...MOCK_USER,
      id: "u2",
      name: "Sarah Williams",
      avatar: "S",
      status: "offline",
    },
    messages: [
      {
        id: "m1",
        text: "I'll send the files over shortly.",
        time: "1h ago",
        isMe: false,
      },
    ],
    lastMessage: { text: "I'll send the files over shortly.", time: "1h ago" },
  },
];

const MOCK_FILES: FileItem[] = [
  {
    id: "1",
    name: "Project Assets",
    type: "folder",
    items: 12,
    date: "Oct 24",
  },
  { id: "2", name: "Documents", type: "folder", items: 8, date: "Oct 22" },
  {
    id: "3",
    name: "Design_Mockup_v2.png",
    type: "image",
    size: "2.4 MB",
    date: "Yesterday",
  },
  {
    id: "4",
    name: "Project_Proposal.pdf",
    type: "document",
    size: "1.8 MB",
    date: "Oct 20",
  },
];

// --- Context ---
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>({
    id: "0",
    name: "Zen Master",
    handle: "zen_master",
    avatar: "Z",
    bio: "Digital explorer & code artisan. Building the future of messaging with Live-Verse. 🚀 #coding #react #nextjs",
    stats: {
      posts: 42,
      followers: 1250,
      following: 340,
    },
  });
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [feeds, setFeeds] = useState<FeedPost[]>(MOCK_FEEDS);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [contacts, setContacts] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>(MOCK_STATUSES);
  const [reels, setReels] = useState<any[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<{
    notifications: boolean;
    privacy: "public" | "private";
    darkMode: boolean;
  }>({
    notifications: true,
    privacy: "public",
    darkMode: true,
  });

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Persist settings & Apply theme
  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));

    // Apply dark mode to document
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }

    console.log("Theme updated:", settings.darkMode ? "dark" : "light");
  }, [settings]);

  // Fetch Feeds, Reels, Marketplace, and Chats from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Posts
      const { data: postsData } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id (id, name, avatar_url, handle, is_verified),
          likes (user_id),
          comments (*)
        `
        )
        .order("created_at", { ascending: false });

      if (postsData) {
        setFeeds(
          postsData.map((post: any) => ({
            id: post.id,
            user: {
              id: post.profiles.id,
              name: post.profiles.name,
              avatar: post.profiles.avatar_url,
              handle: post.profiles.handle,
              isVerified: post.profiles.is_verified,
              bio: "",
              stats: { posts: 0, followers: 0, following: 0 },
            },
            content: post.content,
            stats: {
              likes: post.likes.length,
              comments: post.comments.length,
            },
            liked: post.likes.some((l: any) => l.user_id === currentUser.id),
            commentsList: post.comments.map((c: any) => ({
              id: c.id,
              user: {
                id: c.user_id,
                name: "User",
                avatar: "U",
                handle: "user",
                bio: "",
                stats: { posts: 0, followers: 0, following: 0 },
              },
              text: c.text,
              time: "Recently",
            })),
          }))
        );
      }

      // Fetch Reels
      const { data: reelsData } = await supabase
        .from("reels")
        .select(
          `
          *,
          profiles:user_id (id, name, avatar_url, handle, is_verified),
          likes (user_id)
        `
        )
        .order("created_at", { ascending: false });

      if (reelsData) {
        setReels(
          reelsData.map((r: any) => ({
            id: r.id,
            user: {
              id: r.profiles.id,
              name: r.profiles.name,
              avatar: r.profiles.avatar_url,
              handle: r.profiles.handle,
              isVerified: r.profiles.is_verified,
              bio: "",
              stats: { posts: 0, followers: 0, following: 0 },
            },
            video: r.video_url,
            caption: r.caption,
            stats: {
              likes: r.likes.length,
              comments: 0,
              shares: 0,
            },
            liked: r.likes.some((l: any) => l.user_id === currentUser.id),
          }))
        );
      }

      // Fetch Marketplace
      const { data: marketData } = await supabase
        .from("marketplace_items")
        .select(
          `
          *,
          profiles:seller_id (id, name, avatar_url, handle, is_verified)
        `
        )
        .order("created_at", { ascending: false });

      if (marketData) {
        setMarketplaceItems(marketData);
      }

      // Fetch & Filter Statuses
      const { data: statusesData } = await supabase
        .from("statuses")
        .select(
          `
          *,
          profiles:user_id (id, name, avatar_url, handle, is_verified)
        `
        )
        .order("created_at", { ascending: false });

      if (statusesData) {
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const activeStatuses = statusesData
          .filter(
            (s) => now - new Date(s.created_at).getTime() < twentyFourHours
          )
          .map((s) => ({
            id: s.id,
            user: {
              id: s.profiles.id,
              name: s.profiles.name,
              avatar: s.profiles.avatar_url,
              handle: s.profiles.handle,
              isVerified: s.profiles.is_verified,
              bio: s.profiles.bio || "",
              stats: { posts: 0, followers: 0, following: 0 },
            },
            createdAt: s.created_at,
            items: s.items,
            isUnseen: true, // Mock simple unseen state
          }));
        setStatuses(activeStatuses);
      }

      // Fetch Chats
      const { data: chatsData } = await supabase
        .from("chats")
        .select(
          `
          *,
          chat_participants (
            profiles:user_id (*)
          ),
          messages (*)
        `
        )
        .order("updated_at", { ascending: false });

      if (chatsData) {
        setChats(
          chatsData.map((c: any) => {
            const otherParticipant = c.chat_participants.find(
              (p: any) => p.profiles.id !== currentUser.id
            )?.profiles;
            return {
              id: c.id,
              user: otherParticipant
                ? {
                    id: otherParticipant.id,
                    name: otherParticipant.name,
                    avatar: otherParticipant.avatar_url,
                    handle: otherParticipant.handle,
                    status: "online",
                    isVerified: otherParticipant.is_verified,
                    bio: otherParticipant.bio || "",
                    stats: { posts: 0, followers: 0, following: 0 },
                  }
                : MOCK_USER,
              messages: c.messages.map((m: any) => ({
                id: m.id,
                text: m.text,
                time: new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isMe: m.sender_id === currentUser.id,
                status: "read",
              })),
              lastMessage: {
                text: c.messages[c.messages.length - 1]?.text || "No messages",
                time: "Just now",
              },
              isGroup: c.is_group,
              groupName: c.name,
            };
          })
        );
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, currentUser.id]);

  const toggleLike = useCallback(
    async (targetId: string, targetType: "post" | "reel" = "post") => {
      // Check if liked
      const { data: existingLike } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("target_id", targetId)
        .eq("target_type", targetType)
        .single();

      if (existingLike) {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("target_id", targetId)
          .eq("target_type", targetType);
      } else {
        await supabase.from("likes").insert({
          user_id: currentUser.id,
          target_id: targetId,
          target_type: targetType,
        });
      }

      if (targetType === "post") {
        setFeeds((prev) =>
          prev.map((post) =>
            post.id === targetId
              ? {
                  ...post,
                  liked: !post.liked,
                  stats: {
                    ...post.stats,
                    likes: post.stats.likes + (post.liked ? -1 : 1),
                  },
                }
              : post
          )
        );
      } else {
        setReels((prev) =>
          prev.map((reel) =>
            reel.id === targetId
              ? {
                  ...reel,
                  liked: !reel.liked,
                  stats: {
                    ...reel.stats,
                    likes: (reel.stats.likes || 0) + (reel.liked ? -1 : 1),
                  },
                }
              : reel
          )
        );
      }
    },
    [currentUser.id]
  );

  // Supabase Auth Listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        // Fetch full profile from DB
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const user: User = {
          id: session.user.id,
          name:
            profile?.name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
          handle:
            profile?.handle ||
            session.user.user_metadata?.user_name ||
            session.user.email?.split("@")[0] ||
            "user",
          avatar:
            profile?.avatar_url ||
            session.user.user_metadata?.avatar_url ||
            session.user.email?.[0].toUpperCase() ||
            "U",
          bio: profile?.bio || "Digital explorer",
          stats: profile?.stats || { posts: 0, followers: 0, following: 0 },
          status: "online",
          isVerified: profile?.is_verified || false,
        };
        setCurrentUser(user);
        localStorage.setItem("userData", JSON.stringify(user));
      } else {
        setIsAuthenticated(false);
        setCurrentUser(MOCK_USER); // Reset to dummy if needed or null
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = (data: Partial<User>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem("userData", JSON.stringify(updated));
  };

  // Supabase Real-time Message Listener
  useEffect(() => {
    if (!isAuthenticated || !currentUser.id) return;

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload: any) => {
          const newMessage = payload.new;

          // Only handle if message belongs to one of our chats
          // (In a real app, you'd filter by chat members)

          const formattedMessage: Message = {
            id: newMessage.id,
            text: newMessage.text,
            time: new Date(newMessage.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            isMe: newMessage.sender_id === currentUser.id,
            status: "delivered",
          };

          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === newMessage.chat_id) {
                return {
                  ...chat,
                  messages: [...chat.messages, formattedMessage],
                  lastMessage: {
                    text: formattedMessage.text,
                    time: formattedMessage.time,
                    unread: formattedMessage.isMe
                      ? 0
                      : (chat.lastMessage.unread || 0) + 1,
                  },
                };
              }
              return chat;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, currentUser.id]);

  const addComment = useCallback(
    async (feedId: string, text: string) => {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: currentUser.id,
          post_id: feedId,
          text,
        })
        .select()
        .single();

      if (data) {
        setFeeds((prev) =>
          prev.map((post) => {
            if (post.id.toString() === feedId.toString()) {
              const newComment: Comment = {
                id: data.id,
                user: currentUser,
                text,
                time: "Just now",
              };
              return {
                ...post,
                stats: { ...post.stats, comments: post.stats.comments + 1 },
                commentsList: [...post.commentsList, newComment],
              };
            }
            return post;
          })
        );
      }
    },
    [currentUser]
  );

  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          sender_id: currentUser.id,
          text,
        })
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error.message);
        return;
      }

      // Optimistically update is handled by the real-time listener or we can add it here too
      // For now, we rely on the real-time listener to avoid duplicates
    },
    [currentUser.id]
  );

  const markChatAsRead = useCallback(
    async (chatId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ status: "read" })
        .eq("chat_id", chatId)
        .neq("sender_id", currentUser.id);

      if (error) {
        console.error("Error marking chat as read:", error.message);
        return;
      }

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map((m) => ({ ...m, status: "read" })),
              lastMessage: { ...chat.lastMessage, unread: 0 },
            };
          }
          return chat;
        })
      );
    },
    [currentUser.id]
  );

  const markStatusAsSeen = useCallback((statusId: string) => {
    setStatuses((prev) => {
      const status = prev.find((s) => s.id === statusId);
      if (!status || !status.isUnseen) return prev;

      return prev.map((s) =>
        s.id === statusId ? { ...s, isUnseen: false } : s
      );
    });
  }, []);

  const addStatus = async (text: string, media?: File | string) => {
    let mediaUrl = "";
    const mediaType = (
      media instanceof File && media.type.startsWith("video")
        ? "video"
        : "image"
    ) as "image" | "video";

    if (media instanceof File) {
      const uploaded = await uploadFile("statuses", media);
      if (uploaded) mediaUrl = uploaded;
    } else if (typeof media === "string") {
      mediaUrl = media;
    }

    // Fallback for text-only status
    if (!mediaUrl && text.trim()) {
      mediaUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        text
      )}&background=random&color=fff&size=512`;
    }

    const newItem: {
      id: string;
      type: "image" | "video";
      url: string;
      duration: number;
      content?: string;
    } = {
      id: Date.now().toString(),
      type: mediaType,
      url: mediaUrl,
      content: text,
      duration: 5000,
    };

    const { data: existingStatus } = await supabase
      .from("statuses")
      .select("*")
      .eq("user_id", currentUser.id)
      .single();

    if (existingStatus) {
      const updatedItems = [...existingStatus.items, newItem];
      await supabase
        .from("statuses")
        .update({ items: updatedItems, created_at: new Date().toISOString() })
        .eq("user_id", currentUser.id);
    } else {
      await supabase.from("statuses").insert({
        user_id: currentUser.id,
        items: [newItem],
      });
    }

    // Refresh statuses locally? Or just rely on re-fetching.
    // Let's optimistic update.
    setStatuses((prev) => {
      const existing = prev.find((s) => s.user.id === currentUser.id);
      if (existing) {
        return prev.map((s) =>
          s.user.id === currentUser.id
            ? { ...s, items: [...s.items, newItem], isUnseen: false }
            : s
        );
      }
      return [
        {
          id: Date.now().toString(),
          user: currentUser,
          items: [newItem],
          isUnseen: false,
          createdAt: new Date().toISOString(),
          likes: [],
        },
        ...prev,
      ];
    });
  };

  const toggleStatusLike = useCallback(
    (statusId: string) => {
      setStatuses((prev) =>
        prev.map((s) => {
          if (s.id === statusId) {
            const likes = s.likes || [];
            const liked = likes.includes(currentUser.id);
            return {
              ...s,
              likes: liked
                ? likes.filter((id) => id !== currentUser.id)
                : [...likes, currentUser.id],
            };
          }
          return s;
        })
      );
    },
    [currentUser.id]
  );

  const replyToStatus = useCallback(
    (statusId: string, text: string) => {
      setStatuses((prev) =>
        prev.map((s) => {
          if (s.id === statusId) {
            const replies = s.replies || [];
            return {
              ...s,
              replies: [
                ...replies,
                {
                  userId: currentUser.id,
                  text,
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ],
            };
          }
          return s;
        })
      );
    },
    [currentUser.id]
  );

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      console.log("Updating settings:", updated);
      return updated;
    });
  };

  const toggleArchiveChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat
      )
    );
  };

  const createGroupChat = (name: string, memberIds: string[]) => {
    const groupMembers = users.filter((u) => memberIds.includes(u.id));
    const newChat: Chat = {
      id: Date.now().toString(),
      user: currentUser, // Creator as representative
      messages: [],
      lastMessage: {
        text: "Group created",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      },
      isGroup: true,
      groupName: name,
      members: [currentUser, ...groupMembers],
    };
    setChats((prev) => [newChat, ...prev]);
  };

  const addFile = () => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: `New_Upload_${Math.floor(Math.random() * 1000)}.jpg`,
      type: "image",
      size: "1.2 MB",
      date: "Just now",
    };
    setFiles((prev) => [newFile, ...prev]);
  };

  const addContact = (user: User) => {
    if (!contacts.find((c) => c.id === user.id)) {
      setContacts((prev) => [...prev, user]);
    }
  };

  const toggleCommentLike = (feedId: string, commentId: string) => {
    setFeeds((prev) =>
      prev.map((post) => {
        if (post.id === feedId) {
          return {
            ...post,
            commentsList: post.commentsList.map((comment) =>
              comment.id === commentId
                ? { ...comment, liked: !comment.liked }
                : comment
            ),
          };
        }
        return post;
      })
    );
  };

  const toggleFriend = useCallback(
    async (userId: string) => {
      // Check if following
      const { data: existingFollow } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId)
        .single();

      if (existingFollow) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId);
      } else {
        await supabase.from("follows").insert({
          follower_id: currentUser.id,
          following_id: userId,
        });
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isFriend: !user.isFriend } : user
        )
      );
    },
    [currentUser.id]
  );

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Login error:", error.message);
      return false;
    }
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          user_name: email.split("@")[0],
        },
      },
    });

    if (error) {
      console.error("Signup error:", error.message);
      return false;
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const uploadFile = async (bucket: string, file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${currentUser.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const createPost = async (text: string, media?: File | string) => {
    let mediaUrl = "";
    if (media instanceof File) {
      const uploaded = await uploadFile("posts", media);
      if (uploaded) mediaUrl = uploaded;
    } else if (typeof media === "string") {
      mediaUrl = media;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: currentUser.id,
        content: { text, image: mediaUrl },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error.message);
      return;
    }

    if (data) {
      const newPost: FeedPost = {
        id: data.id,
        user: currentUser,
        content: { text, image: mediaUrl },
        stats: { likes: 0, comments: 0 },
        liked: false,
        commentsList: [],
      };
      setFeeds((prev) => [newPost, ...prev]);
    }
  };

  const createReel = async (caption: string, video: File | string) => {
    let videoUrl = "";
    if (video instanceof File) {
      const uploaded = await uploadFile("reels", video);
      if (uploaded) videoUrl = uploaded;
    } else if (typeof video === "string") {
      videoUrl = video;
    }

    const { data, error } = await supabase
      .from("reels")
      .insert({
        user_id: currentUser.id,
        video_url: videoUrl,
        caption,
      })
      .select()
      .single();

    if (data) {
      setReels((prev) => [
        {
          id: data.id,
          user: currentUser,
          video: data.video_url,
          caption: data.caption,
          stats: { likes: 0, comments: 0, shares: 0 },
        },
        ...prev,
      ]);
    }
  };

  const createMarketplaceItem = async (
    name: string,
    price: string,
    image: File | string,
    category: string
  ) => {
    let imageUrl = "";
    if (image instanceof File) {
      const uploaded = await uploadFile("marketplace", image);
      if (uploaded) imageUrl = uploaded;
    } else if (typeof image === "string") {
      imageUrl = image;
    }

    const { data, error } = await supabase
      .from("marketplace_items")
      .insert({
        seller_id: currentUser.id,
        name,
        price: parseFloat(price.replace(/[^0-9.]/g, "")),
        image_url: imageUrl,
        category,
      })
      .select()
      .single();

    if (data) {
      setMarketplaceItems((prev) => [data, ...prev]);
    }
  };

  const verifyUser = async (userId: string, verifiedStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: verifiedStatus })
      .eq("id", userId);

    if (error) {
      console.error("Verification error:", error.message);
      return;
    }

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, isVerified: verifiedStatus }));
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        feeds,
        chats,
        files,
        contacts,
        statuses,
        isAuthenticated,
        updateProfile,
        toggleLike,
        addComment,
        toggleCommentLike,
        sendMessage,
        addFile,
        toggleFriend,
        addContact,
        markStatusAsSeen,
        addStatus,
        toggleStatusLike,
        replyToStatus,
        toggleArchiveChat,
        createGroupChat,
        login,
        signup,
        logout,
        createPost,
        createReel,
        createMarketplaceItem,
        settings,
        updateSettings,
        signInWithGoogle,
        signInWithApple,
        markChatAsRead,
        uploadFile,
        verifyUser,
        reels,
        marketplaceItems,
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
