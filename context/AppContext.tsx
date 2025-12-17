"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  toggleLike: (feedId: number) => void;
  addComment: (feedId: number, text: string) => void;
  toggleCommentLike: (feedId: number, commentId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  addFile: () => void;
  toggleFriend: (userId: string) => void;
  addContact: (user: User) => void;
  markStatusAsSeen: (statusId: string) => void;
  addStatus: (items: Status["items"]) => void;
  toggleStatusLike: (statusId: string) => void;
  replyToStatus: (statusId: string, text: string) => void;
  toggleArchiveChat: (chatId: string) => void;
  createGroupChat: (name: string, memberIds: string[]) => void;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  createPost: (text: string, image?: string) => void;
  createReel: (caption: string, video: string) => void;
  createMarketplaceItem: (
    name: string,
    price: string,
    image: string,
    category: string
  ) => void;
  settings: {
    notifications: boolean;
    privacy: "public" | "private";
    darkMode: boolean;
  };
  updateSettings: (settings: Partial<AppContextType["settings"]>) => void;
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
    id: 1,
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
    id: 2,
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
    id: 3,
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
    isUnseen: true,
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
  const [settings, setSettings] = useState<{
    notifications: boolean;
    privacy: "public" | "private";
    darkMode: boolean;
  }>({
    notifications: true,
    privacy: "public",
    darkMode: true,
  });

  // Check auth on mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    if (authToken && userData) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const updateProfile = (data: Partial<User>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem("userData", JSON.stringify(updated));
  };

  const toggleLike = (feedId: number) => {
    setFeeds((prev) =>
      prev.map((post) =>
        post.id === feedId
          ? {
              ...post,
              liked: !post.liked,
              stats: {
                ...post.stats,
                likes: post.liked ? post.stats.likes - 1 : post.stats.likes + 1,
              },
            }
          : post
      )
    );
  };

  const addComment = (feedId: number, text: string) => {
    setFeeds((prev) =>
      prev.map((post) => {
        if (post.id === feedId) {
          const newComment: Comment = {
            id: Date.now().toString(),
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
  };

  const sendMessage = (chatId: string, text: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          const newMessage: Message = {
            id: Date.now().toString(),
            text,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            isMe: true,
            status: "sent",
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

  const markStatusAsSeen = (statusId: string) => {
    setStatuses((prev) =>
      prev.map((status) =>
        status.id === statusId ? { ...status, isUnseen: false } : status
      )
    );
  };

  const addStatus = (items: Status["items"]) => {
    setStatuses((prev) => {
      const existingStatusIndex = prev.findIndex(
        (s) => s.user.id === currentUser.id
      );

      if (existingStatusIndex !== -1) {
        const newStatuses = [...prev];
        newStatuses[existingStatusIndex] = {
          ...newStatuses[existingStatusIndex],
          items: [...newStatuses[existingStatusIndex].items, ...items],
          isUnseen: false,
        };
        return newStatuses;
      }

      const newStatus: Status = {
        id: Date.now().toString(),
        user: currentUser,
        items,
        isUnseen: false,
        likes: [],
        replies: [],
      };
      return [newStatus, ...prev];
    });
  };

  const toggleStatusLike = (statusId: string) => {
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
  };

  const replyToStatus = (statusId: string, text: string) => {
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
  };

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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

  const toggleCommentLike = (feedId: number, commentId: string) => {
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

  const toggleFriend = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFriend: !user.isFriend } : user
      )
    );
  };

  const login = (email: string, password: string): boolean => {
    const storedUsers = localStorage.getItem("registeredUsers");
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );
      if (user) {
        localStorage.setItem("authToken", "mock-token-" + Date.now());
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: user.id,
            name: user.name,
            handle: user.handle || user.email.split("@")[0],
            avatar: user.avatar || user.name[0],
            bio: user.bio || "Live-Verse user",
            stats: user.stats || { posts: 0, followers: 0, following: 0 },
          })
        );
        setCurrentUser({
          id: user.id,
          name: user.name,
          handle: user.handle || user.email.split("@")[0],
          avatar: user.avatar || user.name[0],
          bio: user.bio || "Live-Verse user",
          stats: user.stats || { posts: 0, followers: 0, following: 0 },
        });
        setIsAuthenticated(true);
        return true;
      }
    }
    return false;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    const storedUsers = localStorage.getItem("registeredUsers");
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    if (users.find((u: any) => u.email === email)) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      handle: email.split("@")[0],
      avatar: name[0],
      bio: "Live-Verse user",
      stats: { posts: 0, followers: 0, following: 0 },
    };

    users.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(users));

    localStorage.setItem("authToken", "mock-token-" + Date.now());
    localStorage.setItem(
      "userData",
      JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        handle: newUser.handle,
        avatar: newUser.avatar,
        bio: newUser.bio,
        stats: newUser.stats,
      })
    );

    setCurrentUser({
      id: newUser.id,
      name: newUser.name,
      handle: newUser.handle,
      avatar: newUser.avatar,
      bio: newUser.bio,
      stats: newUser.stats,
    });
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsAuthenticated(false);
  };

  const createPost = (text: string, image?: string) => {
    const newPost: FeedPost = {
      id: Date.now(),
      user: currentUser,
      content: { text, image },
      stats: { likes: 0, comments: 0 },
      liked: false,
      commentsList: [],
    };
    setFeeds((prev) => [newPost, ...prev]);
  };

  const createReel = (caption: string, video: string) => {
    // In a real app, this would add to a reels collection
    // For now, we'll just show a success message
    console.log("Reel created:", { caption, video });
  };

  const createMarketplaceItem = (
    name: string,
    price: string,
    image: string,
    category: string
  ) => {
    // In a real app, this would add to a marketplace collection
    // For now, we'll just show a success message
    console.log("Marketplace item created:", { name, price, image, category });
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
