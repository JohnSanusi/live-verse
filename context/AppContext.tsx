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
  isLoading: boolean;
  updateProfile: (data: Partial<User>) => void;
  toggleLike: (targetId: string, targetType?: "post" | "reel") => Promise<void>;
  addComment: (feedId: string, text: string) => Promise<void>;
  toggleCommentLike: (feedId: string, commentId: string) => void;
  verifyUser: (userId: string, status: boolean) => Promise<void>;
  sendMessage: (chatId: string, text: string) => void;
  addFile: () => void;
  toggleFollow: (userId: string) => Promise<void>;
  addContact: (user: User) => void;
  markStatusAsSeen: (statusId: string) => void;
  addStatus: (text: string, media?: File | string) => Promise<void>;
  toggleStatusLike: (statusId: string) => void;
  replyToStatus: (statusId: string, text: string) => void;
  toggleArchiveChat: (chatId: string) => void;
  createGroupChat: (name: string, memberIds: string[]) => void;
  login: (email: string, password: string) => Promise<string | null>;
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
  uploadFile: (bucket: string, file: File) => Promise<string | null>;
  searchUsers: (query: string) => Promise<User[]>;
  reels: any[];
  marketplaceItems: any[];
}

// --- Mock Data Generators Removed ---

// --- Context ---
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>({
    id: "",
    name: "",
    handle: "",
    avatar: "",
    bio: "",
    stats: { posts: 0, followers: 0, following: 0 },
  });
  const [users, setUsers] = useState<User[]>([]);
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
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
                : {
                    id: "unknown",
                    name: "Unknown User",
                    avatar: "U",
                    handle: "unknown",
                    bio: "",
                    stats: { posts: 0, followers: 0, following: 0 },
                  },
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
    let mounted = true;

    const initializeAuth = async () => {
      // Check active session immediately
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        if (mounted) setIsAuthenticated(true);
        await fetchUserProfile(session.user);
      } else {
        if (mounted) setIsAuthenticated(false);
      }
      if (mounted) setIsLoading(false); // Auth check done
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        await fetchUserProfile(session.user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser({
          id: "",
          name: "",
          handle: "",
          avatar: "",
          bio: "",
          stats: { posts: 0, followers: 0, following: 0 },
        });
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    // Fetch full profile from DB
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    let userProfile = profile;

    if (!userProfile) {
      // Profile doesn't exist (likely OAuth first login), create it
      const name =
        authUser.user_metadata?.full_name ||
        authUser.email?.split("@")[0] ||
        "User";
      const handle =
        authUser.user_metadata?.user_name ||
        authUser.email?.split("@")[0] ||
        "user";
      const avatar =
        authUser.user_metadata?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=random&color=fff&size=512`;

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: authUser.id,
          name,
          handle,
          avatar_url: avatar,
          bio: "Just exploring the Void",
        })
        .select()
        .single();

      if (!createError && newProfile) {
        userProfile = newProfile;
      }
    }

    const user: User = {
      id: authUser.id,
      name:
        userProfile?.name ||
        authUser.user_metadata?.full_name ||
        authUser.email?.split("@")[0] ||
        "User",
      handle:
        userProfile?.handle ||
        authUser.user_metadata?.user_name ||
        authUser.email?.split("@")[0] ||
        "user",
      avatar:
        userProfile?.avatar_url ||
        authUser.user_metadata?.avatar_url ||
        authUser.email?.[0].toUpperCase() ||
        "U",
      bio: userProfile?.bio || "Just exploring the Void",
      stats: userProfile?.stats || { posts: 0, followers: 0, following: 0 },
      status: "online",
      isVerified: userProfile?.is_verified || false,
    };
    setCurrentUser(user);
    // Removed localStorage.setItem("userData")
  };

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

  const toggleFollow = useCallback(
    async (userId: string) => {
      console.log("toggleFollow called for userId:", userId);
      console.log("Current user ID:", currentUser?.id);

      if (!currentUser?.id) {
        console.error("Cannot follow: No authenticated user");
        return;
      }

      // Check if following
      const { data: existingFollow, error: checkError } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId)
        .single();

      console.log("Existing follow:", existingFollow, "Error:", checkError);

      if (existingFollow) {
        const { error: deleteError } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId);

        console.log("Unfollow result - Error:", deleteError);
      } else {
        const { error: insertError } = await supabase.from("follows").insert({
          follower_id: currentUser.id,
          following_id: userId,
        });

        console.log("Follow result - Error:", insertError);
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isFriend: !user.isFriend } : user
        )
      );
    },
    [currentUser.id]
  );

  const login = async (
    email: string,
    password: string
  ): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Login error:", error.message);
      return error.message;
    }
    return null;
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
    if (data.user) {
      // Create public profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name: name,
        handle: email.split("@")[0],
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=random&color=fff&size=512`,
        bio: "Just exploring the Void",
      });

      if (profileError) {
        console.error("Profile creation error:", profileError.message);
      }
    }

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // localStorage.clear(); // No longer needed
    window.location.href = "/login";
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
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

  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`name.ilike.%${query.trim()}%,handle.ilike.%${query.trim()}%`)
      .limit(20);

    if (error) {
      console.error("Error searching users:", error.message);
      // NOTE: If this returns "new row violates row-level security policy" or returns empty,
      // ensuring PROFILES table has generic SELECT policy is key:
      // CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
      return [];
    }

    console.log("Search results:", data); // Debug log to see what DB returns

    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUser.id);

    const followingIds = new Set(
      myFollows?.map((f: any) => f.following_id) || []
    );

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      avatar: p.avatar_url,
      bio: p.bio,
      stats: p.stats || { posts: 0, followers: 0, following: 0 },
      isVerified: p.is_verified,
      isFriend: followingIds.has(p.id),
      status: "offline",
    }));
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
        isLoading,
        updateProfile,
        toggleLike,
        addComment,
        toggleCommentLike,
        sendMessage,
        addFile,
        toggleFollow,
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
        markChatAsRead,
        uploadFile,
        verifyUser,
        searchUsers,
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
