"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, FileText, User, Settings, LogOut, Video, ShoppingBag, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Feed" },
    { href: "/reels", icon: Video, label: "Reels" },
    { href: "/chats", icon: MessageCircle, label: "Chats" },
    { href: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { href: "/wallet", icon: Wallet, label: "Wallet" },
    { href: "/files", icon: FileText, label: "Files" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-background/95 backdrop-blur-lg z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Void</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <Settings size={20} />
          <span>Settings</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
          onClick={() => {
            const { logout } = useApp();
            logout();
            window.location.href = "/login";
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
