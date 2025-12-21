"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Flame,
  Star,
  PartyPopper,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FeedPost, Comment } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";
import { ConfirmModal } from "./ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { EliteBadge } from "./EliteBadge";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react"; // Added useState import

interface FeedItemProps extends FeedPost {
  onLike: (reaction?: "like" | "fire" | "wow" | "party") => void;
  onComment: (text: string) => void;
  reaction?: "like" | "fire" | "wow" | "party"; // Added reaction prop
}

export const FeedItem = ({
  id,
  user,
  content,
  stats,
  liked,
  commentsList,
  onLike,
  onComment,
  reaction, // Destructured reaction prop
}: FeedItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false); // Added showReactions state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { toggleCommentLike, deletePost, currentUser } = useApp();
  const { showToast } = useToast();

  const isOwner = currentUser.id === user.id;

  // Added reactions array
  const reactions = [
    { id: "like", icon: Heart, color: "text-red-500", label: "Care" },
    { id: "fire", icon: Flame, color: "text-orange-500", label: "Fire" },
    { id: "wow", icon: Star, color: "text-yellow-500", label: "Wow" },
    {
      id: "party",
      icon: PartyPopper,
      color: "text-purple-500",
      label: "Party",
    },
  ] as const;

  // Added activeReaction and ActiveIcon logic
  const activeReaction = reactions.find((r) => r.id === reaction);
  const ActiveIcon = activeReaction?.icon || Heart;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText("");
      showToast("Comment posted!", "success");
    }
  };

  const handleShare = () => {
    showToast("Link copied to clipboard!", "success");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(id);
      showToast("Post deleted permanently", "success");
    } catch (err) {
      showToast("Failed to delete post", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-card border-b border-border"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Link
          href={`/profile/${user.id}`}
          className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
        >
          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
            {user.avatar.length > 2 ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-primary-foreground font-bold">
                {user.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-sm">{user.name}</h3>
              {user.isVerified && <EliteBadge size={14} />}
            </div>
            <p className="text-xs text-muted-foreground">@{user.handle}</p>
          </div>
        </Link>

        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-10 w-10 p-0 rounded-full"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={20} />
          </Button>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Post?"
        message="This action cannot be undone. This post will be permanently removed from your feed."
        confirmText="Delete"
        isLoading={isDeleting}
      />

      <div className="px-4">
        <p className="text-sm text-foreground/90 mb-3 leading-relaxed">
          {content.text}
        </p>
      </div>

      {content.image && (
        <div className="relative aspect-video w-full bg-muted overflow-hidden">
          <img
            src={content.image}
            alt="Content"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {content.video && (
        <div className="relative aspect-video w-full bg-black overflow-hidden">
          <video
            src={content.video}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <div className="p-4 flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <div className="relative">
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
                  animate={{ opacity: 1, y: -50, scale: 1, x: "-50%" }}
                  exit={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
                  className="absolute left-1/2 bottom-full mb-2 bg-background/80 backdrop-blur-xl border border-border rounded-full p-1.5 flex gap-1 shadow-2xl z-50 ring-1 ring-white/10"
                  onMouseLeave={() => setShowReactions(false)}
                >
                  {reactions.map((r) => (
                    <button
                      key={r.id}
                      className={`h-10 w-10 rounded-full flex items-center justify-center hover:bg-primary/10 transition-all active:scale-90 group ${
                        reaction === r.id ? "bg-primary/10" : ""
                      }`}
                      onClick={() => {
                        onLike(r.id);
                        setShowReactions(false);
                      }}
                    >
                      <r.icon
                        size={20}
                        className={
                          r.id === reaction
                            ? r.color
                            : "text-muted-foreground group-hover:text-primary"
                        }
                        fill={reaction === r.id ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 px-2 transition-all duration-300 ${
                liked
                  ? `${
                      activeReaction?.color || "text-primary"
                    } hover:opacity-80`
                  : "hover:text-primary hover:bg-primary/10"
              }`}
              onMouseEnter={() => setShowReactions(true)}
              onClick={() => {
                if (liked) onLike(reaction); // Unlike
                else onLike("like");
              }}
            >
              <ActiveIcon
                size={18}
                fill={liked ? "currentColor" : "none"}
                className={liked ? "scale-110" : ""}
              />
              <span className="text-xs font-bold">{stats.likes}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 px-2 hover:text-blue-400 hover:bg-blue-400/10"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={18} />
            <span className="text-xs font-bold">{stats.comments}</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 hover:text-green-400 hover:bg-green-400/10"
          onClick={handleShare}
        >
          <Share2 size={18} />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 pt-0 border-t border-border/50">
          <div className="space-y-3 mt-3 max-h-40 overflow-y-auto">
            {commentsList.map((comment: Comment) => (
              <div key={comment.id} className="flex gap-2">
                <Link
                  href={`/profile/${comment.user.id}`}
                  className="flex-shrink-0"
                >
                  <div className="h-6 w-6 rounded-full bg-muted overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
                    {comment.user.avatar.length > 2 ? (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                        {comment.user.name[0]}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="bg-secondary/50 rounded-lg px-3 py-2 text-xs">
                    <span className="font-bold block mb-0.5">
                      {comment.user.name}
                    </span>
                    <p>{comment.text}</p>
                  </div>
                  <div className="flex gap-3 mt-1 ml-1">
                    <button
                      className={`text-[10px] font-medium flex items-center gap-1 transition-colors ${
                        comment.liked
                          ? "text-red-500"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                      onClick={() => {
                        toggleCommentLike(id, comment.id);
                        if (!comment.liked)
                          showToast("Liked comment!", "success");
                      }}
                    >
                      <Heart
                        size={12}
                        fill={comment.liked ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      className="text-[10px] font-medium text-muted-foreground hover:text-primary"
                      onClick={() => setCommentText(`@${comment.user.name} `)}
                    >
                      Reply
                    </button>
                    <span className="text-[10px] text-muted-foreground">
                      {comment.time}
                    </span>
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
            <Button
              type="submit"
              size="sm"
              className="h-9 w-9 p-0 bg-primary text-primary-foreground"
            >
              <Send size={14} />
            </Button>
          </form>
        </div>
      )}
    </motion.div>
  );
};
