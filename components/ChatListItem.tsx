import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { BadgeCheck, Users } from "lucide-react";

interface ChatListItemProps {
  id: string;
  user: {
    name: string;
    avatar: string;
    status: "online" | "offline" | "away";
    isVerified?: boolean;
  };
  lastMessage: {
    text: string;
    time: string;
    unread?: number;
  };
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export const ChatListItem = ({
  id,
  user,
  lastMessage,
  isGroup,
  groupName,
  groupAvatar,
}: ChatListItemProps) => {
  const displayName = isGroup ? groupName : user.name;

  return (
    <Link href={`/chats/${id}`}>
      <Card className="mb-2 border-none bg-transparent hover:bg-secondary/30 transition-colors p-3 active-scale">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden border border-border/50">
              {isGroup ? (
                groupAvatar ? (
                  <img
                    src={groupAvatar}
                    alt={groupName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
                    <Users size={24} />
                  </div>
                )
              ) : user.avatar.length > 2 ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                  {user.name[0]}
                </div>
              )}
            </div>
            {!isGroup && user.status === "online" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {displayName}
                </h3>
                {!isGroup && user.isVerified && (
                  <BadgeCheck
                    size={14}
                    className="text-blue-500 fill-blue-500 flex-shrink-0"
                  />
                )}
                {isGroup && (
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold">
                    Group
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {lastMessage.time}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate pr-2">
                {lastMessage.text}
              </p>
              {lastMessage.unread !== undefined && lastMessage.unread > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in duration-300">
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
