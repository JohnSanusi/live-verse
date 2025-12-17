"use client";

import React from "react";
import { Header } from "@/components/Header";
import {
  User,
  Bell,
  Shield,
  Moon,
  LogOut,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { currentUser, logout } = useApp();
  const { confirm } = useToast();

  const handleLogout = () => {
    confirm({
      title: "Logout",
      message: "Are you sure you want to logout of Void?",
      confirmText: "Logout",
      onConfirm: () => {
        logout();
      },
    });
  };

  const SETTINGS_SECTIONS = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Edit Profile", value: currentUser.name },
        { icon: Shield, label: "Security", value: "Password, 2FA" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", value: "On" },
        { icon: Moon, label: "Appearance", value: "Dark Mode" },
      ],
    },
  ];

  return (
    <div className="pb-20">
      <Header title="Settings" />

      <main className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-secondary/30 rounded-2xl p-4 flex items-center gap-4 border border-border/50">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/30 overflow-hidden">
            {currentUser.avatar.length > 2 ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              currentUser.avatar
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground">
              @{currentUser.handle}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-10 w-10 p-0"
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
              {section.title}
            </h3>
            <div className="bg-secondary/30 rounded-2xl border border-border/50 overflow-hidden">
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors active-scale ${
                    idx !== section.items.length - 1
                      ? "border-b border-border/50"
                      : ""
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-foreground/70">
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button (Mobile) */}
        <div className="pt-4 md:hidden">
          <Button
            variant="ghost"
            className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-bold gap-3 active-scale"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Logout from Void
          </Button>
        </div>
      </main>
    </div>
  );
}
