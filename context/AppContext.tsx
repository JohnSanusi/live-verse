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
  isPrivate?: boolean;
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
    video?: string;
  };
  stats: {
    likes: number;
    comments: number;
  };
  liked: boolean;
  reaction?: "like" | "fire" | "wow" | "party";
  commentsList: Comment[];
}

export interface Message {
  id: string;
  sender_id: string;
  text: string;
  time: string;
  isMe: boolean;
  status?: "sent" | "delivered" | "read";
  readTime?: string;
  image?: string;
  audio?: string;
}

export interface Status {
  id: string;
  user: User;
  items: {
    id: string;
    type: "image" | "video" | "text";
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
  description?: string;
  members?: User[];
  isMuted?: boolean;
  isPinned?: boolean;
  lastReadAt?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "document" | "image";
  size?: string;
  items?: number;
  date: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "follow" | "like" | "comment" | "message";
  actor_id: string;
  actor: User;
  target_id?: string;
  read: boolean;
  created_at: string;
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
  updateProfile: (data: Partial<User>) => Promise<boolean | void>;
  toggleLike: (
    targetId: string,
    targetType?: "post" | "reel" | "status"
  ) => Promise<void>;
  addComment: (feedId: string, text: string) => Promise<void>;
  toggleCommentLike: (feedId: string, commentId: string) => void;
  verifyUser: (userId: string, status: boolean) => Promise<void>;
  sendMessage: (
    chat_id: string,
    text: string,
    media?: File | string,
    audio?: File | string
  ) => Promise<void>;
  clearChat: (chatId: string) => Promise<void>;
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
  typingUsers: { [chatId: string]: boolean };
  setTyping: (chatId: string, isTyping: boolean) => void;
  createPost: (text: string, media?: File | string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  createReel: (caption: string, video: File | string) => Promise<void>;
  createMarketplaceItem: (
    name: string,
    price: string,
    image: File | string,
    category: string
  ) => Promise<void>;
  settings: any;
  updateSettings: (newSettings: any) => void;
  markChatAsRead: (chatId: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  uploadFile: (bucket: string, file: File) => Promise<string | null>;
  searchUsers: (query: string) => Promise<User[]>;
  saveSearchQuery: (query: string) => Promise<void>;
  getSearchHistory: () => Promise<string[]>;
  deleteSearchHistoryItem: (query: string) => Promise<void>;
  reels: any[];
  marketplaceItems: any[];
  notifications: Notification[];
  unreadNotificationsCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  createChat: (userId: string) => Promise<string | null>;
  followers: User[];
  following: User[];
  fetchFollowLists: () => Promise<void>;
  fetchChats: () => Promise<void>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: boolean }>(
    {}
  );

  const setTyping = useCallback(
    (chatId: string, isTyping: boolean) => {
      const channel = supabase.channel(`chat_type_${chatId}`);
      channel.send({
        type: "broadcast",
        event: "typing",
        payload: { isTyping, user_id: currentUser.id },
      });
      setTypingUsers((prev) => ({ ...prev, [chatId]: isTyping }));
    },
    [currentUser.id]
  );
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
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
  }, [settings]);

  // No longer persisting currentUser to localStorage to avoid stale state on refresh
  // Supabase auth listener handles this more reliably.

  const fetchUsers = useCallback(async () => {
    if (!currentUser.id) return;
    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(10);

    if (profilesData && !error) {
      const { data: myFollows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      const followingIds = new Set(
        myFollows?.map((f: any) => f.following_id) || []
      );

      setUsers(
        profilesData.map((p: any) => ({
          id: p.id,
          name: p.name,
          handle: p.handle,
          avatar: p.avatar_url,
          bio: p.bio,
          stats: p.stats || { posts: 0, followers: 0, following: 0 },
          isVerified: p.is_verified,
          isFriend: followingIds.has(p.id),
          status: "offline",
        }))
      );
    }
  }, [currentUser.id]);

  const searchUsers = useCallback(
    async (query: string): Promise<User[]> => {
      if (!query.trim() || !currentUser.id) return [];

      console.log("Executing searchUsers with query:", query);

      try {
        // Add 5-second timeout to prevent infinite loading
        const searchPromise = (async () => {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .or(`name.ilike.%${query.trim()}%,handle.ilike.%${query.trim()}%`)
            .limit(20);

          if (error) {
            console.error("Error searching users:", error);
            return [];
          }

          console.log("searchUsers found", data?.length || 0, "results.");

          // Get our following list to mark friends
          const { data: follows } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", currentUser.id);
          const followingIds = new Set(
            follows?.map((f) => f.following_id) || []
          );

          // Mark if they are friends/followed, but show all (Instagram style)
          return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            handle: p.handle,
            avatar: p.avatar_url,
            bio: p.bio,
            stats: { posts: 0, followers: 0, following: 0 },
            isVerified: p.is_verified,
            isFriend: followingIds.has(p.id),
            status: "offline" as const,
          }));
        })();

        const timeoutPromise = new Promise<User[]>((resolve) => {
          setTimeout(() => {
            console.warn("Search timed out after 5 seconds");
            resolve([]);
          }, 5000);
        });

        return await Promise.race([searchPromise, timeoutPromise]);
      } catch (err) {
        console.error("Search failed:", err);
        return [];
      }
    },
    [currentUser.id]
  );

  const fetchChats = useCallback(async () => {
    if (!currentUser.id) return;

    try {
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
                    status: "offline",
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
              messages: (c.messages || [])
                .map((m: any) => ({
                  id: m.id,
                  sender_id: m.sender_id,
                  text: m.text,
                  image: m.image_url,
                  audio: m.audio_url,
                  time: new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  isMe: m.sender_id === currentUser.id,
                  status: m.status || "sent",
                  readTime: m.read_at
                    ? new Date(m.read_at).toLocaleTimeString()
                    : undefined,
                }))
                .sort(
                  (a: any, b: any) =>
                    new Date(a.time).getTime() - new Date(b.time).getTime()
                ),
              lastMessage: {
                text: c.messages?.[c.messages.length - 1]?.audio_url
                  ? "🎤 Voice Message"
                  : c.messages?.[c.messages.length - 1]?.image_url
                  ? "📷 Photo"
                  : c.messages?.[c.messages.length - 1]?.text || "No messages",
                time: c.messages?.[c.messages.length - 1]
                  ? new Date(
                      c.messages[c.messages.length - 1].created_at
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "",
                unread:
                  c.messages?.filter(
                    (m: any) =>
                      m.sender_id !== currentUser.id && m.status !== "read"
                  ).length || 0,
              },
              isGroup: c.is_group,
              groupName: c.name,
              groupAvatar: c.avatar_url,
              description: c.description,
              members: c.chat_participants.map((p: any) => ({
                id: p.profiles.id,
                name: p.profiles.name,
                avatar: p.profiles.avatar_url,
                handle: p.profiles.handle,
              })),
            };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, [currentUser.id]);

  const fetchFollowLists = useCallback(async () => {
    if (!currentUser.id) return;

    try {
      // Fetch following
      const { data: followingData } = await supabase
        .from("follows")
        .select("following:following_id(*)")
        .eq("follower_id", currentUser.id);

      if (followingData && followingData.length > 0) {
        setFollowing(
          followingData.map((f: any) => ({
            id: f.following.id,
            name: f.following.name,
            handle: f.following.handle,
            avatar: f.following.avatar_url || "",
            bio: f.following.bio || "",
            stats: { posts: 0, followers: 0, following: 0 },
            isVerified: f.following.is_verified,
          }))
        );
      } else {
        setFollowing([]);
      }

      // Fetch followers
      const { data: followersData } = await supabase
        .from("follows")
        .select("follower:follower_id(*)")
        .eq("following_id", currentUser.id);

      if (followersData && followersData.length > 0) {
        setFollowers(
          followersData.map((f: any) => ({
            id: f.follower.id,
            name: f.follower.name,
            handle: f.follower.handle,
            avatar: f.follower.avatar_url || "",
            bio: f.follower.bio || "",
            stats: { posts: 0, followers: 0, following: 0 },
            isVerified: f.follower.is_verified,
          }))
        );
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error("Error fetching follow lists:", error);
    }
  }, [currentUser.id]);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser.id) return;
    const { data } = await supabase
      .from("notifications")
      .select(
        `
        *,
        actor:actor_id (id, name, handle, avatar_url, is_verified)
      `
      )
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(
        data.map((n: any) => ({
          id: n.id,
          user_id: n.user_id,
          type: n.type,
          actor_id: n.actor_id,
          actor: {
            id: n.actor.id,
            name: n.actor.name,
            handle: n.actor.handle,
            avatar: n.actor.avatar_url,
            bio: "",
            stats: { posts: 0, followers: 0, following: 0 },
            isVerified: n.actor.is_verified,
          },
          target_id: n.target_id,
          read: n.read,
          created_at: n.created_at,
        }))
      );
    }
  }, [currentUser.id]);

  const fetchPosts = useCallback(async () => {
    if (!currentUser.id) return;
    const { data: postsData } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (id, name, avatar_url, handle, is_verified),
        likes (user_id),
        comments (
          id,
          text,
          created_at,
          user_id,
          profiles:user_id (id, name, avatar_url, handle, is_verified)
        )
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
              id: c.profiles.id,
              name: c.profiles.name,
              avatar: c.profiles.avatar_url,
              handle: c.profiles.handle,
              isVerified: c.profiles.is_verified,
              bio: "",
              stats: { posts: 0, followers: 0, following: 0 },
            },
            text: c.text,
            time: new Date(c.created_at).toLocaleString(),
          })),
        }))
      );
    }
  }, [currentUser.id]);

  const fetchReelsData = useCallback(async () => {
    if (!currentUser.id) return;
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
  }, [currentUser.id]);

  const fetchMarketplace = useCallback(async () => {
    if (!currentUser.id) return;
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
  }, []);

  const fetchStatuses = useCallback(async () => {
    if (!currentUser.id) return;
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
        .filter((s) => now - new Date(s.created_at).getTime() < twentyFourHours)
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
          isUnseen: true,
        }));
      setStatuses(activeStatuses);
    }
  }, []);

  // Initial Fetch & Realtime setup
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial load
    fetchPosts();
    fetchReelsData();
    fetchMarketplace();
    fetchStatuses();
    fetchUsers();
    fetchChats();
    fetchNotifications();
    fetchFollowLists();

    // Subscribe to all changes
    const channel = supabase
      .channel("app-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => {
          fetchUsers();
          fetchPosts(); // Profiles are joined in posts
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        () => {
          fetchPosts();
          fetchReelsData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // New message received
            fetchChats();
          } else if (payload.eventType === "UPDATE") {
            // Message statused updated (read receipt)
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === payload.new.chat_id
                  ? {
                      ...chat,
                      messages: chat.messages.map((m) =>
                        m.id === payload.new.id
                          ? {
                              ...m,
                              status: payload.new.status,
                              readTime: payload.new.read_at
                                ? new Date(
                                    payload.new.read_at
                                  ).toLocaleTimeString()
                                : undefined,
                            }
                          : m
                      ),
                    }
                  : chat
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_participants",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => fetchChats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "follows" },
        () => {
          fetchUsers();
          fetchFollowLists();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.id}`,
        },
        async (payload) => {
          console.log("New notification received:", payload.new);
          // Fetch the full notification data (with actor join)
          const { data } = await supabase
            .from("notifications")
            .select(
              `
              *,
              actor:actor_id (id, name, handle, avatar_url, is_verified)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const newNotif: Notification = {
              id: data.id,
              user_id: data.user_id,
              type: data.type as any,
              actor_id: data.actor_id,
              actor: {
                id: data.actor.id,
                name: data.actor.name,
                handle: data.actor.handle,
                avatar: data.actor.avatar_url,
                bio: "",
                stats: { posts: 0, followers: 0, following: 0 },
                isVerified: data.actor.is_verified,
              },
              target_id: data.target_id,
              read: data.read,
              created_at: data.created_at,
            };

            setNotifications((prev) => [newNotif, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "statuses" },
        () => fetchStatuses()
      )
      .subscribe();

    // 2. Presence Tracking (Online Status)
    const presenceChannel = supabase.channel("online-users", {
      config: { presence: { key: currentUser.id } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const newState = presenceChannel.presenceState();
        const onlineIds = new Set(Object.keys(newState));
        setOnlineUsers(onlineIds);

        // Update local users/chats status reactively
        setUsers((prev) =>
          prev.map((u) => ({
            ...u,
            status: onlineIds.has(u.id)
              ? ("online" as const)
              : ("offline" as const),
          }))
        );
        setChats((prev) =>
          prev.map((c) => ({
            ...c,
            user: {
              ...c.user,
              status: onlineIds.has(c.user.id)
                ? ("online" as const)
                : ("offline" as const),
            },
          }))
        );
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [
    isAuthenticated,
    fetchPosts,
    fetchReelsData,
    fetchMarketplace,
    fetchStatuses,
    fetchUsers,
    fetchChats,
    fetchNotifications,
    fetchFollowLists,
    currentUser.id,
  ]);

  const toggleLike = useCallback(
    async (
      targetId: string,
      targetType: "post" | "reel" | "status" = "post"
    ) => {
      if (!currentUser?.id) {
        console.warn("Cannot like: user not authenticated");
        return;
      }

      // Optimistic Update
      const updateLocalState = (isLiked: boolean) => {
        if (targetType === "post") {
          setFeeds((prev) =>
            prev.map((post) =>
              post.id === targetId
                ? {
                    ...post,
                    liked: isLiked,
                    stats: {
                      ...post.stats,
                      likes: post.stats.likes + (isLiked ? 1 : -1),
                    },
                  }
                : post
            )
          );
        } else if (targetType === "reel") {
          setReels((prev) =>
            prev.map((reel) =>
              reel.id === targetId
                ? {
                    ...reel,
                    liked: isLiked,
                    stats: {
                      ...reel.stats,
                      likes: (reel.stats.likes || 0) + (isLiked ? 1 : -1),
                    },
                  }
                : reel
            )
          );
        } else if (targetType === "status") {
          setStatuses((prev) =>
            prev.map((status) =>
              status.id === targetId ? { ...status, liked: isLiked } : status
            )
          );
        }
      };

      // Find current state
      const post = feeds.find((f) => f.id === targetId);
      const reel = reels.find((r) => r.id === targetId);
      const currentlyLiked =
        targetType === "post"
          ? post?.liked
          : targetType === "reel"
          ? reel?.liked
          : false;

      const nextLikedState = !currentlyLiked;
      updateLocalState(nextLikedState);

      try {
        const { data: existingLike } = await supabase
          .from("likes")
          .select("*")
          .eq("user_id", currentUser.id)
          .eq("target_id", targetId)
          .eq("target_type", targetType)
          .single();

        if (existingLike) {
          // Unlike
          const { error } = await supabase
            .from("likes")
            .delete()
            .eq("user_id", currentUser.id)
            .eq("target_id", targetId)
            .eq("target_type", targetType);
          if (error) throw error;
        } else {
          // Like
          const { error } = await supabase.from("likes").insert({
            user_id: currentUser.id,
            target_id: targetId,
            target_type: targetType,
          });
          if (error) throw error;

          // Send notification for like
          const targetOwnerId =
            targetType === "post"
              ? post?.user.id
              : targetType === "reel"
              ? reel?.user.id
              : statuses.find((s) => s.id === targetId)?.user.id;

          if (targetOwnerId && targetOwnerId !== currentUser.id) {
            await createNotification(targetOwnerId, "like", targetId);
          }
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        // Rollback
        updateLocalState(currentlyLiked!);
      }
    },
    [currentUser.id, feeds, reels, statuses]
  );

  // Supabase Auth Listener - Simplified and robust
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      try {
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
      } catch (err) {
        console.error("Auth state change handling failed:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    });

    const checkSession = async () => {
      // Safety timeout for auth initialization (max 10 seconds)
      const timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn("Auth initialization timed out!");
          setIsLoading(false);
        }
      }, 10000);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setIsAuthenticated(true);
          await fetchUserProfile(session.user);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        clearTimeout(timeoutId);
        if (mounted) setIsLoading(false);
      }
    };
    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchFollowLists();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async (authUser: any) => {
    try {
      // Fetch full profile from DB
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      let userProfile = dbProfile;

      if (!dbProfile) {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: authUser.id,
            name:
              authUser.user_metadata?.full_name ||
              authUser.email?.split("@")[0] ||
              "User",
            handle:
              authUser.user_metadata?.user_name ||
              authUser.email?.split("@")[0] ||
              "user",
            avatar_url: authUser.user_metadata?.avatar_url || "",
            bio: "Just exploring the Void",
          })
          .select()
          .single();

        if (!createError && newProfile) {
          userProfile = newProfile;
        }
      }

      // Calculate real stats in parallel to prevent blocking profile load
      const [postsRes, followersRes, followingRes] = await Promise.all([
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", authUser.id),
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", authUser.id),
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", authUser.id),
      ]);

      const postsCount = postsRes?.count || 0;
      const followersCount = followersRes?.count || 0;
      const followingCount = followingRes?.count || 0;

      const profile: User = {
        id: authUser.id,
        name:
          userProfile?.name || authUser.user_metadata?.full_name || "New User",
        handle:
          userProfile?.handle ||
          authUser.user_metadata?.user_name ||
          authUser.email?.split("@")[0] ||
          "user",
        avatar:
          userProfile?.avatar_url ||
          authUser.user_metadata?.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userProfile?.name || "User"
          )}&background=random`,
        bio: userProfile?.bio || "Just exploring the Void",
        stats: {
          posts: postsCount || 0,
          followers: followersCount || 0,
          following: followingCount || 0,
        },
        isVerified: userProfile?.is_verified || false,
        coverPhoto: userProfile?.cover_url || "",
        isPrivate: userProfile?.is_private || false,
      };

      setCurrentUser(profile);
      setIsLoading(false); // Success!
    } catch (err) {
      console.error("fetchUserProfile failed:", err);
      // Fallback: Set currentUser even if stats fail to prevent hung loader
      if (authUser) {
        setCurrentUser((prev) => ({
          ...prev,
          id: authUser.id,
          name:
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "User",
        }));
      }
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!currentUser.id) return;

      const profileUpdate: any = {};
      if (data.name !== undefined) profileUpdate.name = data.name;
      if (data.bio !== undefined) profileUpdate.bio = data.bio;
      if (data.avatar !== undefined) profileUpdate.avatar_url = data.avatar;
      if (data.coverPhoto !== undefined)
        profileUpdate.cover_url = data.coverPhoto;

      const {
        data: updateData,
        error,
        count,
      } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", currentUser.id)
        .select();

      console.log(
        "Supabase response - Data:",
        updateData,
        "Error:",
        error,
        "Count:",
        count
      );

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      if (!updateData || updateData.length === 0) {
        // Fallback: If no data returned but no error, assume success if count > 0 or if we're confident
        console.warn(
          "No data returned from profile update, but no error reported."
        );
      }

      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);

      // Update the user in the global users list as well
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u))
      );

      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const uploadFile = async (bucket: string, file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const addComment = useCallback(
    async (feedId: string, text: string) => {
      const tempId = `temp-${Math.random()}`;
      const optimisticComment: Comment = {
        id: tempId,
        user: currentUser,
        text,
        time: "Just now",
      };

      setFeeds((prev) =>
        prev.map((post) => {
          if (post.id.toString() === feedId.toString()) {
            return {
              ...post,
              stats: { ...post.stats, comments: post.stats.comments + 1 },
              commentsList: [...post.commentsList, optimisticComment],
            };
          }
          return post;
        })
      );

      try {
        const { data, error } = await supabase
          .from("comments")
          .insert({
            user_id: currentUser.id,
            post_id: feedId,
            text,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          // Notification for comment
          const post = feeds.find((f) => f.id.toString() === feedId.toString());
          if (post?.user.id) {
            await createNotification(post.user.id, "comment", feedId);
          }

          setFeeds((prev) =>
            prev.map((post) => {
              if (post.id.toString() === feedId.toString()) {
                return {
                  ...post,
                  commentsList: post.commentsList.map((c) =>
                    c.id === tempId ? { ...c, id: data.id } : c
                  ),
                };
              }
              return post;
            })
          );
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        setFeeds((prev) =>
          prev.map((post) => {
            if (post.id.toString() === feedId.toString()) {
              return {
                ...post,
                stats: {
                  ...post.stats,
                  comments: Math.max(0, post.stats.comments - 1),
                },
                commentsList: post.commentsList.filter((c) => c.id !== tempId),
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
    async (
      chatId: string,
      text: string,
      media?: File | string,
      audio?: File | string
    ) => {
      const tempId = `temp-${Math.random()}`;
      const optimisticMsg: Message = {
        id: tempId,
        sender_id: currentUser.id,
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
        status: "sent",
        image:
          media instanceof File
            ? URL.createObjectURL(media)
            : typeof media === "string"
            ? media
            : undefined,
        audio:
          audio instanceof File
            ? URL.createObjectURL(audio)
            : typeof audio === "string"
            ? audio
            : undefined,
      };

      // Update chats locally
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, optimisticMsg],
                lastMessage: {
                  text:
                    text ||
                    (audio
                      ? "🎤 Voice Message"
                      : media
                      ? "📷 Photo"
                      : "No messages"),
                  time: "Just now",
                },
              }
            : chat
        )
      );

      try {
        let mediaUrl = "";
        let voiceUrl = "";

        if (media instanceof File) {
          const uploaded = await uploadFile("messages", media);
          if (uploaded) mediaUrl = uploaded;
        } else if (typeof media === "string") {
          mediaUrl = media;
        }

        if (audio instanceof File) {
          const uploaded = await uploadFile("voice_notes", audio);
          if (uploaded) voiceUrl = uploaded;
        } else if (typeof audio === "string") {
          voiceUrl = audio;
        }

        const { data, error } = await supabase
          .from("messages")
          .insert({
            chat_id: chatId,
            sender_id: currentUser.id,
            text,
            image_url: mediaUrl,
            audio_url: voiceUrl,
          })
          .select()
          .single();

        if (error) throw error;

        // Update chat's updated_at and send notification (Instagram style)
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          await Promise.all([
            supabase
              .from("chats")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", chatId),
            // Re-fetch chats on the recipient's side is handled by Realtime,
            // but we can send a dedicated notification to trigger an alert.
            createNotification(chat.user.id, "message", chatId),
          ]);
        }

        if (data) {
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === chatId) {
                // If the message was already added by Realtime, just remove the temp one
                const alreadyAdded = chat.messages.some(
                  (m) => m.id === data.id
                );
                if (alreadyAdded) {
                  return {
                    ...chat,
                    messages: chat.messages.filter((m) => m.id !== tempId),
                  };
                }

                // Otherwise replace temp with real message
                return {
                  ...chat,
                  messages: chat.messages.map((m) =>
                    m.id === tempId
                      ? {
                          ...m,
                          id: data.id,
                          image: mediaUrl,
                          audio: voiceUrl,
                          status: "sent",
                        }
                      : m
                  ),
                  lastMessage: {
                    text:
                      text ||
                      (voiceUrl
                        ? "🎤 Voice Message"
                        : mediaUrl
                        ? "📷 Photo"
                        : "No messages"),
                    time: "Just now",
                  },
                };
              }
              return chat;
            })
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Rollback
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter((m) => m.id !== tempId),
                }
              : chat
          )
        );
      }
    },
    [currentUser.id]
  );

  const markChatAsRead = useCallback(
    async (chatId: string) => {
      // Use the RPC function if possible, or regular update
      const { error } = await supabase
        .from("messages")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("chat_id", chatId)
        .neq("sender_id", currentUser.id)
        .neq("status", "read");

      if (error) {
        console.error("Error marking chat as read:", error.message);
        return;
      }

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map((m) =>
                m.sender_id !== currentUser.id ? { ...m, status: "read" } : m
              ),
              lastMessage: { ...chat.lastMessage, unread: 0 },
            };
          }
          return chat;
        })
      );
    },
    [currentUser.id]
  );

  const clearChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("chat_id", chatId);

      if (error) throw error;

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [],
                lastMessage: { text: "No messages", time: "" },
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

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
    let mediaType: "image" | "video" | "text" = "text";

    if (media instanceof File) {
      mediaType = media.type.startsWith("video") ? "video" : "image";
      const uploaded = await uploadFile("statuses", media);
      if (uploaded) mediaUrl = uploaded;
    } else if (typeof media === "string") {
      mediaUrl = media;
      mediaType = "image"; // Assume string URLs are images
    }

    // For text-only status (WhatsApp style)
    if (!media && text.trim()) {
      mediaType = "text";
      mediaUrl = ""; // No media URL for text-only
    }

    const newItem: {
      id: string;
      type: "image" | "video" | "text";
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

  const updateSettings = async (newSettings: Partial<typeof settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      console.log("Updating settings:", updated);
      return updated;
    });

    if (newSettings.privacy && currentUser.id) {
      const isPrivate = newSettings.privacy === "private";
      await supabase
        .from("profiles")
        .update({ is_private: isPrivate })
        .eq("id", currentUser.id);

      setCurrentUser((prev) => ({ ...prev, isPrivate }));
    }
  };

  const toggleArchiveChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat
      )
    );
  };

  const createGroupChat = async (name: string, members: string[]) => {
    try {
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({ name, is_group: true })
        .select()
        .single();

      if (chatError) throw chatError;

      if (newChat) {
        const participants = [
          { chat_id: newChat.id, user_id: currentUser.id },
          ...members.map((id) => ({ chat_id: newChat.id, user_id: id })),
        ];

        const { error: partError } = await supabase
          .from("chat_participants")
          .insert(participants);

        if (partError) throw partError;
        await fetchChats();
      }
    } catch (error) {
      console.error("Error creating group chat:", error);
    }
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
      if (!currentUser?.id) return;

      // Optimistic Update
      const updateLocalState = (isFollowing: boolean) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isFriend: isFollowing } : u
          )
        );
      };

      const user = users.find((u) => u.id === userId);
      const currentlyFollowing = user?.isFriend;
      const nextFollowingState = !currentlyFollowing;

      updateLocalState(nextFollowingState);

      try {
        const { data: existingFollow } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId)
          .single();

        if (existingFollow) {
          const { error } = await supabase
            .from("follows")
            .delete()
            .eq("follower_id", currentUser.id)
            .eq("following_id", userId);
          if (error) throw error;

          // User requested notifications for unfollows
          await createNotification(userId, "unfollow");
        } else {
          const { error } = await supabase.from("follows").insert({
            follower_id: currentUser.id,
            following_id: userId,
          });
          if (error) throw error;

          // Notification for follow
          await createNotification(userId, "follow");
        }

        await fetchFollowLists();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) await fetchUserProfile(authUser);
      } catch (error) {
        console.error("Error toggling follow:", error);
        updateLocalState(currentlyFollowing!); // Rollback
      }
    },
    [currentUser.id, users, fetchFollowLists, fetchUserProfile]
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

  const createPost = async (text: string, media?: File | string) => {
    const tempId = `temp-${Math.random()}`;

    // Determine if media is video or image
    const isVideo =
      (media instanceof File && media.type.startsWith("video/")) ||
      (typeof media === "string" &&
        (media.includes(".mp4") ||
          media.includes(".mov") ||
          media.includes(".webm") ||
          media.includes("video")));

    const optimisticPost: FeedPost = {
      id: tempId,
      user: currentUser,
      content: {
        text,
        image:
          !isVideo && media instanceof File
            ? URL.createObjectURL(media)
            : !isVideo && typeof media === "string"
            ? media
            : undefined,
        video:
          isVideo && media instanceof File
            ? URL.createObjectURL(media)
            : undefined,
      },
      stats: { likes: 0, comments: 0 },
      liked: false,
      commentsList: [],
    };

    setFeeds((prev) => [optimisticPost, ...prev]);

    try {
      let mediaUrl = "";
      if (media instanceof File) {
        const uploaded = await uploadFile("posts", media);
        if (uploaded) mediaUrl = uploaded;
      } else if (typeof media === "string") {
        mediaUrl = media;
      }

      const contentData: any = { text };
      if (isVideo) {
        contentData.video = mediaUrl;
      } else if (mediaUrl) {
        contentData.image = mediaUrl;
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: currentUser.id,
          content: contentData,
        })
        .select()
        .single();

      if (error) throw error;

      if (!data) throw new Error("Post insertion failed: No data returned");

      if (data) {
        setFeeds((prev) =>
          prev.map((p) =>
            p.id === tempId ? { ...p, id: data.id, content: contentData } : p
          )
        );
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      // Remove optimistic post on failure
      setFeeds((prev) => prev.filter((p) => p.id !== tempId));
      throw error; // Let the UI handle the error toast for better feedback
    }
  };

  const deletePost = async (postId: string) => {
    // Optimistic update
    setFeeds((prev) => prev.filter((post) => post.id !== postId));

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting post:", error);
      // Re-fetch posts on error
      fetchPosts();
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

  const createNotification = async (
    targetUserId: string,
    type: "like" | "comment" | "follow" | "unfollow" | "message",
    targetId?: string
  ) => {
    if (!currentUser.id || targetUserId === currentUser.id) return;

    try {
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        actor_id: currentUser.id,
        type,
        target_id: targetId,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const saveSearchQuery = useCallback(
    async (query: string) => {
      if (!currentUser.id || !query.trim()) return;
      try {
        await supabase.from("search_history").upsert({
          user_id: currentUser.id,
          query: query.trim(),
          created_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error saving search query:", error);
      }
    },
    [currentUser.id]
  );

  const getSearchHistory = useCallback(async (): Promise<string[]> => {
    if (!currentUser.id) return [];
    try {
      const { data } = await supabase
        .from("search_history")
        .select("query")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data?.map((i) => i.query) || [];
    } catch (error) {
      console.error("Error getting search history:", error);
      return [];
    }
  }, [currentUser.id]);

  const deleteSearchHistoryItem = useCallback(
    async (query: string) => {
      if (!currentUser.id) return;
      try {
        await supabase
          .from("search_history")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("query", query);
      } catch (error) {
        console.error("Error deleting search history item:", error);
      }
    },
    [currentUser.id]
  );

  const markNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const createChat = async (userId: string): Promise<string | null> => {
    if (!currentUser.id) return null;

    try {
      // Check if chat already exists
      const { data: existingChats } = await supabase
        .from("chat_participants")
        .select("chat_id")
        .eq("user_id", currentUser.id);

      if (existingChats) {
        for (const { chat_id } of existingChats) {
          const { data: participants } = await supabase
            .from("chat_participants")
            .select("user_id")
            .eq("chat_id", chat_id);

          const userIds = participants?.map((p) => p.user_id) || [];
          if (userIds.length === 2 && userIds.includes(userId)) {
            // Chat already exists, ensure it's in local state
            const existing = chats.find((c) => c.id === chat_id);
            if (!existing) {
              await fetchChats(); // Refresh chats if not found locally
            }
            return chat_id;
          }
        }
      }

      // Create new chat
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({ is_group: false, created_by: currentUser.id })
        .select()
        .single();

      if (chatError) throw chatError;

      if (newChat) {
        const { error: partError } = await supabase
          .from("chat_participants")
          .insert([
            { chat_id: newChat.id, user_id: currentUser.id },
            { chat_id: newChat.id, user_id: userId },
          ]);

        if (partError) throw partError;

        // Force a fresh fetch of all chats to ensure we have full metadata
        await fetchChats();

        // Wait a small moment for state to settle
        return newChat.id;
      }
    } catch (error: any) {
      console.error("Error creating chat:", error.message);
    }

    return null;
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

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
        typingUsers,
        setTyping,
        fetchChats,
        fetchFollowLists,
        fetchNotifications,
        createPost,
        deletePost,
        createReel,
        createMarketplaceItem,
        settings,
        updateSettings,
        signInWithGoogle,
        markChatAsRead,
        uploadFile,
        verifyUser,
        searchUsers,
        saveSearchQuery,
        getSearchHistory,
        deleteSearchHistoryItem,
        reels,
        marketplaceItems,
        notifications,
        unreadNotificationsCount: notifications.filter((n) => !n.read).length,
        markNotificationAsRead: async (id) => {
          await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", id);
          fetchNotifications();
        },
        createChat,
        clearChat,
        followers,
        following,
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
