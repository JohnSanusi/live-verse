"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Folder, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/chats", label: "Chats", icon: MessageSquare },
    { href: "/files", label: "Files", icon: Folder },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-background/95 backdrop-blur-lg z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Live-Verse</h1>
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
        <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10">
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
