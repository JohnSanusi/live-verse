"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Send, Gift } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FeedPost, Comment } from "@/context/AppContext";
import { GiftPicker } from "@/components/GiftPicker";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

interface FeedItemProps extends FeedPost {
  onLike: () => void;
  onComment: (text: string) => void;
}

export const FeedItem = ({ id, user, content, stats, liked, commentsList, onLike, onComment }: FeedItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const { currentUser, sendGift } = useApp();

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText("");
    }
  };

  const handleSendGift = (giftId: string) => {
    sendGift(user.id, giftId);
  };

  return (
    <div className="bg-card border-b border-border">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
            {user.avatar.length > 2 ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-primary-foreground font-bold">
                {user.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">{user.name}</h3>
            <p className="text-xs text-muted-foreground">@{user.handle}</p>
          </div>
        </Link>
      </div>
      
      <div className="px-4">  
        <p className="text-sm text-foreground/90 mb-3 leading-relaxed">{content.text}</p>
      </div>

      {content.image && (
        <div className="relative aspect-video w-full bg-muted overflow-hidden">
           {content.image.startsWith("http") ? (
             <img src={content.image} alt="Content" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-muted-foreground">
               Image Content
             </div>
           )}
        </div>
      )}

      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-2 px-2 ${liked ? "text-red-500 hover:text-red-600" : "hover:text-primary hover:bg-primary/10"}`}
            onClick={onLike}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span className="text-xs font-medium">{stats.likes}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 px-2 hover:text-blue-400 hover:bg-blue-400/10"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={18} />
            <span className="text-xs font-medium">{stats.comments}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 px-2 hover:text-primary hover:bg-primary/10"
            onClick={() => setShowGiftPicker(true)}
          >
            <Gift size={18} />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="px-2 hover:text-green-400 hover:bg-green-400/10">
          <Share2 size={18} />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 pt-0 border-t border-border/50">
          <div className="space-y-3 mt-3 max-h-40 overflow-y-auto">
            {commentsList.map((comment: Comment) => (
              <div key={comment.id} className="flex gap-2">
                <Link href={`/profile/${comment.user.id}`} className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-muted overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
                      {comment.user.avatar.length > 2 ? (
                          <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                              {comment.user.name[0]}
                          </div>
                      )}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="bg-secondary/50 rounded-lg px-3 py-2 text-xs">
                      <span className="font-bold block mb-0.5">{comment.user.name}</span>
                      <p>{comment.text}</p>
                  </div>
                  <div className="flex gap-3 mt-1 ml-1">
                    <button className="text-[10px] font-medium text-muted-foreground hover:text-primary flex items-center gap-1">
                      <Heart size={12} />
                    </button>
                    <button 
                        className="text-[10px] font-medium text-muted-foreground hover:text-primary"
                        onClick={() => setCommentText(`@${comment.user.name} `)}
                    >
                        Reply
                    </button>
                    <span className="text-[10px] text-muted-foreground">2m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
            <Input 
                placeholder="Write a comment..." 
                className="h-9 text-xs" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
            />
            <Button type="submit" size="sm" className="h-9 w-9 p-0 bg-primary text-primary-foreground">
                <Send size={14} />
            </Button>
          </form>
        </div>
      )}

      {/* Gift Picker */}
      {showGiftPicker && (
        <GiftPicker
          onClose={() => setShowGiftPicker(false)}
          onSendGift={handleSendGift}
          userCoins={currentUser.coins || 0}
        />
      )}
    </div>
  );
};
