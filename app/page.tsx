
"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { FeedItem } from "@/components/FeedItem";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";

const TRENDING_TOPICS = [
  { id: 1, tag: "#LiveVerse", posts: "1.2k posts" },
  { id: 2, tag: "#Design", posts: "850 posts" },
  { id: 3, tag: "#Tech", posts: "500 posts" },
  { id: 4, tag: "#NextJS", posts: "320 posts" },
  { id: 5, tag: "#React", posts: "210 posts" },
];

export default function Home() {
  const { feeds, toggleLike, addComment } = useApp();

  return (
    <div className="pb-20">
      <Header 
        title="Feed" 
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
              <Search size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
              <Bell size={20} />
            </Button>
          </div>
        } 
      />
      
      <main className="p-4 space-y-6">
        {/* Trending Section */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Trending</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {TRENDING_TOPICS.map((topic) => (
              <div 
                key={topic.id} 
                className="flex-shrink-0 bg-secondary/50 border border-border rounded-xl p-3 min-w-[120px]"
              >
                <p className="font-bold text-primary">{topic.tag}</p>
                <p className="text-xs text-muted-foreground">{topic.posts}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feed Section */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Recent Activity</h2>
          <div className="space-y-4">
            {feeds.map((feed) => (
              <FeedItem 
                key={feed.id} 
                {...feed} 
                onLike={() => toggleLike(feed.id)}
                onComment={(text) => addComment(feed.id, text)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
