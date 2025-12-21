"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Search, X, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useApp, User } from "@/context/AppContext";
import { EliteBadge } from "@/components/EliteBadge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const {
    searchUsers,
    toggleFollow,
    currentUser,
    users,
    feeds,
    saveSearchQuery,
    getSearchHistory,
    deleteSearchHistoryItem,
  } = useApp();

  // Load history ONLY when currentUser is available
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchHistory = async () => {
      const h = await getSearchHistory();
      setHistory(h);
    };
    fetchHistory();
  }, [getSearchHistory, currentUser?.id]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await searchUsers(query);
        const filtered = users.filter((u) => u.id !== currentUser.id);
        setResults(filtered);

        // Save to history ONLY if we have results or user specifically searched
        if (filtered.length > 0) {
          saveSearchQuery(query);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [query, searchUsers, currentUser.id, saveSearchQuery]);

  const handleDeleteHistory = async (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    await deleteSearchHistoryItem(item);
    setHistory((prev) => prev.filter((i) => i !== item));
  };

  const suggestions = users
    .filter((u) => u.id !== currentUser.id && !u.isFriend)
    .slice(0, 5);

  const trending = feeds.slice(0, 3);

  return (
    <div className="pb-20 bg-background min-h-screen">
      <Header title="Discover" />

      <div className="p-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search for people or topics..."
            className="pl-12 bg-secondary/50 border-none rounded-2xl h-12 text-sm focus-visible:ring-primary/20"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 space-y-8">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Searching Void
            </p>
          </div>
        ) : query.trim().length > 1 ? (
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-2">
              Search Results
            </h2>
            {results.length > 0 ? (
              results.map((user) => (
                <SearchResultCard
                  key={user.id}
                  user={user}
                  onFollow={toggleFollow}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10 italic">
                No users found
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Search History */}
            {history.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Recent Searches
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((item) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setQuery(item)}
                      className="px-4 py-2 bg-secondary/40 border border-border/50 rounded-full flex items-center gap-2 cursor-pointer hover:bg-secondary/60 transition-colors"
                    >
                      <span className="text-xs font-medium">{item}</span>
                      <button
                        onClick={(e) => handleDeleteHistory(e, item)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested People */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Suggested for you
                </h2>
                <button className="text-[10px] font-black uppercase tracking-widest text-primary">
                  See All
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                {suggestions.map((user) => (
                  <SuggestionCard
                    key={user.id}
                    user={user}
                    onFollow={toggleFollow}
                  />
                ))}
              </div>
            </div>

            {/* Trending Content */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-2">
                Trending on Void
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {trending.map((post) => (
                  <TrendingCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const SearchResultCard = ({
  user,
  onFollow,
}: {
  user: User;
  onFollow: any;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between p-4 bg-secondary/30 rounded-3xl border border-white/5"
  >
    <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-2xl bg-muted overflow-hidden">
        <img src={user.avatar} className="w-full h-full object-cover" />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <h3 className="font-bold text-sm">{user.name}</h3>
          {user.isVerified && <EliteBadge size={14} />}
        </div>
        <p className="text-xs text-muted-foreground">@{user.handle}</p>
      </div>
    </Link>
    <Button
      size="sm"
      variant={user.isFriend ? "secondary" : "primary"}
      onClick={() => onFollow(user.id)}
      className="h-9 px-6 rounded-xl font-bold text-xs"
    >
      {user.isFriend ? "Unfollow" : "Follow"}
    </Button>
  </motion.div>
);

const SuggestionCard = ({ user, onFollow }: { user: User; onFollow: any }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="flex-shrink-0 w-40 bg-card border border-border rounded-[2rem] p-4 flex flex-col items-center text-center gap-3"
  >
    <div className="h-20 w-20 rounded-3xl bg-muted overflow-hidden shadow-inner">
      <img src={user.avatar} className="w-full h-full object-cover" />
    </div>
    <div className="space-y-0.5">
      <h3 className="font-bold text-sm truncate w-32">{user.name}</h3>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        Suggested
      </p>
    </div>
    <Button
      size="sm"
      className="w-full h-9 rounded-2xl font-bold text-[10px] uppercase tracking-widest"
      onClick={() => onFollow(user.id)}
    >
      Follow
    </Button>
  </motion.div>
);

const TrendingCard = ({ post }: { post: any }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-secondary/20 border border-border rounded-3xl overflow-hidden group cursor-pointer"
  >
    {post.content.image && (
      <div className="aspect-[21/9] overflow-hidden">
        <img
          src={post.content.image}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    )}
    <div className="p-4">
      <p className="text-sm line-clamp-2 font-medium mb-2">
        {post.content.text}
      </p>
      <div className="flex items-center gap-2">
        <img src={post.user.avatar} className="h-5 w-5 rounded-full" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {post.user.name}
        </span>
      </div>
    </div>
  </motion.div>
);
