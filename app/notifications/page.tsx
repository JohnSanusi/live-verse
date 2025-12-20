"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Heart, MessageSquare, Bell } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markNotificationAsRead } =
    useApp();

  useEffect(() => {
    fetchNotifications();

    // Mark all as read when leaving the page (or on mount for simplicity)
    const markAllRead = async () => {
      for (const n of notifications) {
        if (!n.read) {
          await markNotificationAsRead(n.id);
        }
      }
    };

    return () => {
      markAllRead();
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <UserPlus className="text-blue-500" size={20} />;
      case "like":
        return <Heart className="text-red-500" size={20} fill="currentColor" />;
      case "comment":
        return <MessageSquare className="text-green-500" size={20} />;
      default:
        return <Bell className="text-primary" size={20} />;
    }
  };

  const getMessage = (type: string) => {
    switch (type) {
      case "follow":
        return "started following you";
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "message":
        return "sent you a message";
      default:
        return "interacted with you";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center gap-4">
        <Link
          href="/"
          className="p-2 hover:bg-secondary rounded-full transition-colors active-scale"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
      </div>

      <div className="flex flex-col">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              href={`/profile/${n.actor_id}`}
              className={`flex items-start gap-4 p-4 border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                !n.read ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex-shrink-0 mt-1">{getIcon(n.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary border border-border">
                    {n.actor.avatar ? (
                      <img
                        src={n.actor.avatar}
                        alt={n.actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
                        {n.actor.name[0]}
                      </div>
                    )}
                  </div>
                  <span className="font-bold truncate">{n.actor.name}</span>
                </div>

                <p className="text-sm text-foreground/80 lowercase">
                  {getMessage(n.type)}
                </p>

                <span className="text-[10px] text-muted-foreground mt-2 block">
                  {formatDistanceToNow(new Date(n.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-primary self-center" />
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
