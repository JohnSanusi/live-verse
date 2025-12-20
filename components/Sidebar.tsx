"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Video,
  Search,
  ShoppingBag,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";

export const Sidebar = () => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout, unreadNotificationsCount } =
    useApp();
  const { confirm } = useToast();

  if (isLoading) return null; // Or return a Skeleton sidebar
  if (!isAuthenticated && pathname === "/login") return null;
  if (!isAuthenticated && pathname === "/signup") return null;

  const navItems = [
    { href: "/", icon: Home, label: "Feed" },
    { href: "/search", icon: Search, label: "Search" },
    {
      href: "/notifications",
      icon: Bell,
      label: "Notifications",
      badge: unreadNotificationsCount,
    },
    { href: "/chats", icon: MessageCircle, label: "Chats" },
    { href: "/reels", icon: Video, label: "Reels" },
    { href: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const handleLogout = () => {
    confirm({
      title: "Logout",
      message: "Are you sure you want to logout of Void?",
      confirmText: "Logout",
      onConfirm: () => {
        logout();
      },
    });
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-background/95 backdrop-blur-lg z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Void</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active-scale ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {label === "Notifications" && unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                    {unreadNotificationsCount > 9
                      ? "9+"
                      : unreadNotificationsCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 transition-all duration-200 active-scale ${
              pathname === "/settings"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 active-scale"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
