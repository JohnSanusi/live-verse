"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  User,
  Video,
  ShoppingBag,
  Search,
  Bell,
} from "lucide-react";

import { useApp } from "@/context/AppContext";

export const BottomNav = () => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, unreadNotificationsCount } = useApp();

  if (isLoading) return null; // Or return a Skeleton nav
  if (!isAuthenticated && pathname === "/login") return null;
  if (!isAuthenticated && pathname === "/signup") return null;

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/chats", icon: MessageCircle, label: "Chats" },
    { href: "/reels", icon: Video, label: "Reels" },
    { href: "/settings", icon: User, label: "Settings" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl pb-safe">
      <div className="flex h-18 items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center py-2 transition-all duration-200 active:scale-90 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors relative ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                {label === "Activity" && unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-background">
                    {unreadNotificationsCount > 9
                      ? "9+"
                      : unreadNotificationsCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold mt-0.5 ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
