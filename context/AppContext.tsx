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
  text: string;
  time: string;
  isMe: boolean;
  status?: "sent" | "delivered" | "read";
  readTime?: string;
  image?: string;
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
    targetType?: "post" | "reel",
    reaction?: "like" | "fire" | "wow" | "party"
  ) => Promise<void>;
  addComment: (feedId: string, text: string) => Promise<void>;
  toggleCommentLike: (feedId: string, commentId: string) => void;
  verifyUser: (userId: string, status: boolean) => Promise<void>;
  sendMessage: (
    chat_id: string,
    text: string,
    media?: File | string
  ) => Promise<void>;
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
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: boolean }>(
    {}
  );

  const setTyping = useCallback((chatId: string, isTyping: boolean) => {
    setTypingUsers((prev) => ({ ...prev, [chatId]: isTyping }));
  }, []);
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

  // Load settings & user on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.id) {
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      }
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

  // Persist currentUser
  useEffect(() => {
    if (currentUser.id) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(10);

    if (data && !error) {
      const { data: myFollows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      const followingIds = new Set(
        myFollows?.map((f: any) => f.following_id) || []
      );

      setUsers(
        data.map((p: any) => ({
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
      if (!query.trim()) return [];

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
              messages: (c.messages || []).map((m: any) => ({
                id: m.id,
                text: m.text,
                image: m.image_url,
                time: new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isMe: m.sender_id === currentUser.id,
                status: "read",
              })),
              lastMessage: {
                text:
                  c.messages?.[c.messages.length - 1]?.text || "No messages",
                time: "Just now",
              },
              isGroup: c.is_group,
              groupName: c.name,
            };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, [currentUser.id]);

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

      // Fetch Initial Users for suggestions
      await fetchUsers();

      // Fetch Chats via standalone function
      await fetchChats();
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, currentUser.id, fetchChats, fetchUsers]);

  const toggleLike = useCallback(
    async (
      targetId: string,
      targetType: "post" | "reel" = "post",
      reaction: "like" | "fire" | "wow" | "party" = "like"
    ) => {
      // Optimistic Update
      const updateLocalState = (isLiked: boolean, react?: any) => {
        if (targetType === "post") {
          setFeeds((prev) =>
            prev.map((post) =>
              post.id === targetId
                ? {
                    ...post,
                    liked: isLiked,
                    reaction: isLiked ? react : undefined,
                    stats: {
                      ...post.stats,
                      likes: post.stats.likes + (isLiked ? 1 : -1),
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
                    liked: isLiked,
                    stats: {
                      ...reel.stats,
                      likes: (reel.stats.likes || 0) + (isLiked ? 1 : -1),
                    },
                  }
                : reel
            )
          );
        }
      };

      // Find current state
      const post = feeds.find((f) => f.id === targetId);
      const reel = reels.find((r) => r.id === targetId);
      const currentlyLiked = targetType === "post" ? post?.liked : reel?.liked;
      const currentReaction = post?.reaction;

      // If already liked with DIFFERENT reaction, change it
      // If already liked with SAME reaction, unlike it
      const isSameReaction = currentReaction === reaction;
      const nextLikedState = currentlyLiked ? !isSameReaction : true;
      const nextReaction = reaction;

      updateLocalState(nextLikedState, nextReaction);

      try {
        const { data: existingLike } = await supabase
          .from("likes")
          .select("*")
          .eq("user_id", currentUser.id)
          .eq("target_id", targetId)
          .eq("target_type", targetType)
          .single();

        if (existingLike) {
          if (isSameReaction) {
            const { error } = await supabase
              .from("likes")
              .delete()
              .eq("user_id", currentUser.id)
              .eq("target_id", targetId)
              .eq("target_type", targetType);
            if (error) throw error;

            // Notification for unfollow is rare, but user requested notifications for unfollows too
            // However, usually we don't notify for "unlike".
          } else {
            const { error } = await supabase
              .from("likes")
              .update({ reaction })
              .eq("user_id", currentUser.id)
              .eq("target_id", targetId)
              .eq("target_type", targetType);
            if (error) throw error;

            // Notify for reaction change
            const targetOwnerId =
              targetType === "post" ? post?.user.id : reel?.user.id;
            if (targetOwnerId) {
              await createNotification(targetOwnerId, "like", targetId);
            }
          }
        } else {
          const { error } = await supabase.from("likes").insert({
            user_id: currentUser.id,
            target_id: targetId,
            target_type: targetType,
            reaction,
          });
          if (error) throw error;

          // Notification for like
          const targetOwnerId =
            targetType === "post" ? post?.user.id : reel?.user.id;
          if (targetOwnerId) {
            await createNotification(targetOwnerId, "like", targetId);
          }
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        // Rollback
        updateLocalState(currentlyLiked!, currentReaction);
      }
    },
    [currentUser.id, feeds, reels]
  );

  // Supabase Auth Listener
  useEffect(() => {
    let mounted = true;
    let authInitialized = false;

    const initializeAuth = async () => {
      // Safety timeout: force loading to false after 5 seconds
      const timeoutId = setTimeout(() => {
        if (mounted && !authInitialized) {
          console.warn(
            "Auth initialization timed out, forcing loading to false"
          );
          setIsLoading(false);
        }
      }, 5000);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          if (mounted) setIsAuthenticated(true);
          // Only fetch if onAuthStateChange hasn't already started it
          if (!authInitialized) {
            await fetchUserProfile(session.user);
          }
        } else {
          if (mounted) setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        clearTimeout(timeoutId);
        if (mounted) {
          authInitialized = true;
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        if (mounted) {
          authInitialized = true;
          setIsLoading(false);
        }
      }
    });

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

  const fetchFollowLists = async () => {
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
  };

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

      // Calculate real stats
      const { count: postsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", authUser.id);

      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", authUser.id);

      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", authUser.id);

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
      localStorage.setItem("currentUser", JSON.stringify(profile));
    } catch (err) {
      console.error("fetchUserProfile failed:", err);
      // Ensure we set SOME state so loader doesn't hang
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
        throw new Error("No rows modified during profile update");
      }

      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);

      // Update the user in the global users list as well
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u))
      );

      // Persist to localStorage
      localStorage.setItem("currentUser", JSON.stringify(updated));

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

  // Real-time Notifications Listener
  useEffect(() => {
    if (!isAuthenticated || !currentUser.id) return;

    const channel = supabase
      .channel(`notifications:${currentUser.id}`)
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, currentUser.id]);

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
    async (chatId: string, text: string, media?: File | string) => {
      const tempId = `temp-${Math.random()}`;
      const optimisticMsg: Message = {
        id: tempId,
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
      };

      // Update chats locally
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, optimisticMsg],
                lastMessage: { text: text || "Image", time: "Just now" },
              }
            : chat
        )
      );

      try {
        let mediaUrl = "";
        if (media instanceof File) {
          const uploaded = await uploadFile("messages", media);
          if (uploaded) mediaUrl = uploaded;
        } else if (typeof media === "string") {
          mediaUrl = media;
        }

        const { data, error } = await supabase
          .from("messages")
          .insert({
            chat_id: chatId,
            sender_id: currentUser.id,
            text,
            image_url: mediaUrl,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: chat.messages.map((m) =>
                      m.id === tempId
                        ? { ...m, id: data.id, image: mediaUrl }
                        : m
                    ),
                  }
                : chat
            )
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
    const optimisticPost: FeedPost = {
      id: tempId,
      user: currentUser,
      content: {
        text,
        image:
          media instanceof File
            ? URL.createObjectURL(media)
            : typeof media === "string"
            ? media
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

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: currentUser.id,
          content: { text, image: mediaUrl },
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFeeds((prev) =>
          prev.map((p) =>
            p.id === tempId
              ? { ...p, id: data.id, content: { text, image: mediaUrl } }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setFeeds((prev) => prev.filter((p) => p.id !== tempId));
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
    type: "like" | "comment" | "follow" | "unfollow",
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

  const fetchNotifications = async () => {
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
  };

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
        .insert({ is_group: false })
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

        await fetchChats(); // Refresh local chats state
        return newChat.id;
      }
    } catch (error) {
      console.error("Error creating chat:", error);
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
