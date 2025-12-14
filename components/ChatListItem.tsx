import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface ChatListItemProps {
  id: string;
  user: {
    name: string;
    avatar: string;
    status: "online" | "offline" | "away";
  };
  lastMessage: {
    text: string;
    time: string;
    unread?: number;
  };
}

export const ChatListItem = ({ id, user, lastMessage }: ChatListItemProps) => {
  return (
    <Link href={`/chats/${id}`}>
      <Card className="mb-2 border-none bg-transparent hover:bg-secondary/30 transition-colors p-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
               {user.avatar.length > 2 ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                   {user.name[0]}
                 </div>
               )}
            </div>
            {user.status === "online" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{lastMessage.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate pr-2">{lastMessage.text}</p>
              {lastMessage.unread && lastMessage.unread > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {lastMessage.unread}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
