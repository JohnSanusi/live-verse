"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, FileText, User, Video } from "lucide-react";

export const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/reels", icon: Video, label: "Reels" },
    { href: "/chats", icon: MessageCircle, label: "Chats" },
    { href: "/files", icon: FileText, label: "Files" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg pb-safe">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
