"use client";

import React, { useState } from "react";
import {
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Type,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";

interface StatusCreatorProps {
  onClose: () => void;
}

export const StatusCreator = ({ onClose }: StatusCreatorProps) => {
  const [type, setType] = useState<"text" | "image" | "video">("text");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const { addStatus } = useApp();
  const { showToast } = useToast();

  const handleCreate = () => {
    if (type === "text" && !content.trim()) return;
    if (type !== "text" && !mediaUrl.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      type: type === "text" ? "image" : type, // Text status will be rendered as a styled image-like block
      url: type === "text" ? "" : mediaUrl,
      content: type === "text" ? content : "",
      duration: 5000,
    };

    // For mock purposes, if it's text, we'll just use a placeholder background
    if (type === "text") {
      newItem.url = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        content
      )}&background=random&color=fff&size=512`;
    }

    addStatus([newItem as any]);
    showToast("Status posted!", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create Status</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={type === "text" ? "primary" : "secondary"}
            className="flex-1 gap-2 rounded-xl h-12"
            onClick={() => setType("text")}
          >
            <Type size={18} />
            <span>Text</span>
          </Button>
          <Button
            variant={type === "image" ? "primary" : "secondary"}
            className="flex-1 gap-2 rounded-xl h-12"
            onClick={() => setType("image")}
          >
            <ImageIcon size={18} />
            <span>Image</span>
          </Button>
          <Button
            variant={type === "video" ? "primary" : "secondary"}
            className="flex-1 gap-2 rounded-xl h-12"
            onClick={() => setType("video")}
          >
            <VideoIcon size={18} />
            <span>Video</span>
          </Button>
        </div>

        <div className="space-y-4">
          {type === "text" ? (
            <textarea
              placeholder="Type your status..."
              className="w-full bg-secondary/50 border border-border rounded-xl p-4 min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-primary text-lg text-center flex items-center justify-center"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          ) : (
            <div className="space-y-4">
              <input
                type="file"
                id="status-upload"
                className="hidden"
                accept={type === "image" ? "image/*" : "video/*"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setMediaUrl(url);
                  }
                }}
              />
              <Button
                variant="secondary"
                className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() =>
                  document.getElementById("status-upload")?.click()
                }
              >
                {type === "image" ? (
                  <ImageIcon size={24} />
                ) : (
                  <VideoIcon size={24} />
                )}
                <span className="text-xs font-medium">
                  Click to upload {type}
                </span>
              </Button>

              {mediaUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border group">
                  {type === "image" ? (
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={mediaUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  <button
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setMediaUrl("")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          <Button
            className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold gap-2 active-scale"
            onClick={handleCreate}
            disabled={
              (type === "text" && !content.trim()) ||
              (type !== "text" && !mediaUrl.trim())
            }
          >
            <Send size={18} />
            Post Status
          </Button>
        </div>
      </div>
    </div>
  );
};
