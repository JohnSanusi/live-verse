"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useApp, User } from "@/context/AppContext";
import { EliteBadge } from "@/components/EliteBadge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { searchUsers, toggleFriend, currentUser } = useApp();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        const users = await searchUsers(query);
        setResults(users.filter((u) => u.id !== currentUser.id));
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, searchUsers, currentUser.id]);

  return (
    <div className="pb-20 bg-background min-h-screen">
      <Header title="Search" />

      <div className="p-4 sticky top-14 z-10 bg-background/80 backdrop-blur-md">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search for people..."
            className="pl-10 bg-secondary/50 border-none rounded-full h-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Searching...
          </div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-2xl animate-in fade-in slide-in-from-bottom-2"
            >
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 flex-1"
              >
                <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                  {user.avatar.length > 2 ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                      {user.avatar}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-sm">{user.name}</h3>
                    {user.isVerified && <EliteBadge size={14} />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    @{user.handle}
                  </p>
                </div>
              </Link>
              <Button
                size="sm"
                variant={user.isFriend ? "secondary" : "primary"}
                onClick={() => toggleFriend(user.id)}
                className={`h-8 px-4 text-xs font-bold rounded-full ${
                  user.isFriend ? "bg-secondary text-foreground" : ""
                }`}
              >
                {user.isFriend ? "Following" : "Follow"}
              </Button>
            </div>
          ))
        ) : query.trim().length > 1 ? (
          <div className="text-center text-muted-foreground py-10">
            No users found
          </div>
        ) : (
          <div className="text-center text-muted-foreground/50 py-20">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>Type to search for friends</p>
          </div>
        )}
      </div>
    </div>
  );
}
