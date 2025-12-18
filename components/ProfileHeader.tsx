import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings, Edit2, Check, X, Camera } from "lucide-react";
import { User, useApp } from "@/context/AppContext";
import { EliteBadge } from "./EliteBadge";

interface ProfileHeaderProps {
  user: User;
  isCurrentUser?: boolean;
  autoEdit?: boolean;
}

export const ProfileHeader = ({
  user,
  isCurrentUser = true,
  autoEdit = false,
}: ProfileHeaderProps) => {
  const { updateProfile, toggleFriend } = useApp();
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);

  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editCover, setEditCover] = useState(user.coverPhoto);

  const handleSave = () => {
    updateProfile({
      name: editName,
      bio: editBio,
      avatar: editAvatar,
      coverPhoto: editCover,
    });
    setIsEditing(false);
  };

  const handleMediaUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === "avatar") setEditAvatar(url);
      else setEditCover(url);
    }
  };

  const handleCancel = () => {
    setEditName(user.name);
    setEditBio(user.bio);
    setIsEditing(false);
  };

  return (
    <div className="relative mb-6">
      {/* Cover Image */}
      <div className="relative h-32 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-secondary overflow-hidden">
        {(isEditing ? editCover : user.coverPhoto) && (
          <img
            src={isEditing ? editCover : user.coverPhoto}
            className="w-full h-full object-cover"
            alt="Cover"
          />
        )}
        {isEditing && (
          <button
            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
            onClick={() => document.getElementById("cover-upload")?.click()}
          >
            <Camera size={24} />
            <input
              type="file"
              id="cover-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleMediaUpload(e, "cover")}
            />
          </button>
        )}
      </div>

      <div className="px-4">
        <div className="flex justify-between items-end -mt-10 mb-4">
          <div className="relative h-24 w-24 rounded-full border-4 border-background bg-secondary overflow-hidden group">
            {(isEditing ? editAvatar : user.avatar).length > 2 ? (
              <img
                src={isEditing ? editAvatar : user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-primary-foreground text-3xl font-bold">
                {(isEditing ? editName : user.name)[0]}
              </div>
            )}
            {isEditing && (
              <button
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
              >
                <Camera size={20} />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleMediaUpload(e, "avatar")}
                />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-1">
            {isCurrentUser ? (
              isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    onClick={handleSave}
                  >
                    <Check size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    onClick={handleCancel}
                  >
                    <X size={20} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-full border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-full"
                  >
                    <Settings size={20} />
                  </Button>
                </>
              )
            ) : (
              <Button
                variant={user.isFriend ? "outline" : "primary"}
                size="sm"
                className={`h-9 px-4 rounded-full ${
                  user.isFriend
                    ? "border-primary/50 text-primary"
                    : "bg-primary text-primary-foreground"
                }`}
                onClick={() => toggleFriend(user.id)}
              >
                {user.isFriend ? "Friends" : "Add Friend"}
              </Button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mb-4">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mb-1 h-8 font-bold text-lg"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
              {user.isVerified && <EliteBadge size={18} />}
            </div>
          )}
          <p className="text-sm text-muted-foreground">@{user.handle}</p>
        </div>

        {/* Bio */}
        {isEditing ? (
          <Input
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            className="mb-4 h-auto py-2"
          />
        ) : (
          <p className="text-sm text-foreground/90 mb-4 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-6 border-y border-border py-3">
          <div className="text-center">
            <span className="block font-bold text-foreground">
              {user.stats.posts}
            </span>
            <span className="text-xs text-muted-foreground">Posts</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-foreground">
              {user.stats.followers}
            </span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-foreground">
              {user.stats.following}
            </span>
            <span className="text-xs text-muted-foreground">Following</span>
          </div>
        </div>
      </div>
    </div>
  );
};
