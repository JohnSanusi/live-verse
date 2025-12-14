import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings, Edit2, Check, X } from "lucide-react";
import { User, useApp } from "@/context/AppContext";

interface ProfileHeaderProps {
  user: User;
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const { updateProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);

  const handleSave = () => {
    updateProfile({ name: editName, bio: editBio });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(user.name);
    setEditBio(user.bio);
    setIsEditing(false);
  };

  return (
    <div className="relative mb-6">
      {/* Cover Image */}
      <div className="h-32 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-secondary"></div>
      
      <div className="px-4">
        <div className="flex justify-between items-end -mt-10 mb-4">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full border-4 border-background bg-secondary overflow-hidden">
             <div className="w-full h-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-primary-foreground text-2xl font-bold">
               {user.name[0]}
             </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 mb-1">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20" onClick={handleSave}>
                  <Check size={20} />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={handleCancel}>
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
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
                  <Settings size={20} />
                </Button>
              </>
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
            <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
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
            <p className="text-sm text-foreground/90 mb-4 leading-relaxed">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6 border-y border-border py-3">
          <div className="text-center">
            <span className="block font-bold text-foreground">{user.stats.posts}</span>
            <span className="text-xs text-muted-foreground">Posts</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-foreground">{user.stats.followers}</span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-foreground">{user.stats.following}</span>
            <span className="text-xs text-muted-foreground">Following</span>
          </div>
        </div>
      </div>
    </div>
  );
};
