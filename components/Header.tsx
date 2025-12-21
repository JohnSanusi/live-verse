```
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export const Header = ({ title, action, className }: HeaderProps) => {
  const pathname = usePathname();
  const { unreadNotificationsCount } = useApp();

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl ${
        className || ""
      }`}
    >
      <h1 className="text-xl font-black tracking-tight text-foreground">
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <Link
          href="/notifications"
          className="relative p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <Bell
            size={22}
            className={pathname === "/notifications" ? "text-primary" : "text-foreground"}
            strokeWidth={pathname === "/notifications" ? 2.5 : 2}
          />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-background">
              {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
            </span>
          )}
        </Link>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </header>
  );
};
```
