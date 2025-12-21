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
import { Switch } from "@/components/ui/Switch";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsPage() {
  const { currentUser, logout, settings, updateSettings, isLoading } = useApp();
  const { confirm, showToast } = useToast();
  const router = useRouter();

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

  const toggleNotification = () => {
    updateSettings({ notifications: !settings.notifications });
    showToast(
      `Notifications ${!settings.notifications ? "enabled" : "disabled"}`,
      "info"
    );
  };

  const toggleDarkMode = () => {
    const nextValue = !settings.darkMode;
    console.log("Toggling dark mode to:", nextValue);
    updateSettings({ darkMode: nextValue });
    showToast(`${nextValue ? "Dark Mode" : "Light Mode"} set`, "info");
  };

  const cyclePrivacy = () => {
    const nextPrivacy = settings.privacy === "public" ? "private" : "public";
    updateSettings({ privacy: nextPrivacy });
    showToast(`Account is now ${nextPrivacy}`, "info");
  };

  const SETTINGS_SECTIONS = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Edit Profile",
          value: currentUser.name,
          action: () => router.push(`/profile?edit=true`),
        },
        {
          icon: Shield,
          label: "Privacy",
          value:
            settings.privacy.charAt(0).toUpperCase() +
            settings.privacy.slice(1),
          action: cyclePrivacy,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          value: settings.notifications ? "On" : "Off",
          action: toggleNotification,
        },
        {
          icon: Moon,
          label: "Appearance",
          value: settings.darkMode ? "Dark Mode" : "Light Mode",
          action: toggleDarkMode,
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="pb-20 min-h-screen bg-background">
        <Header title="Settings" />
        <main className="p-4 space-y-6 max-w-2xl mx-auto">
          <div className="w-full bg-secondary/30 rounded-3xl p-5 flex items-center gap-4">
            <Skeleton variant="circle" className="h-20 w-20" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-6 w-1/3" />
              <Skeleton variant="text" className="h-4 w-1/4" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton variant="text" className="h-4 w-16 px-4" />
            <div className="bg-secondary/20 rounded-[2rem] p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-background">
      <Header title="Settings" />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Profile Card */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.push(`/profile`)}
          className="w-full bg-secondary/30 rounded-3xl p-5 flex items-center gap-4 border border-border/50 hover:bg-secondary/50 transition-all active-scale"
        >
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl border-2 border-primary/30 overflow-hidden shadow-inner">
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
          <div className="flex-1 text-left">
            <h2 className="font-bold text-xl">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground">
              @{currentUser.handle}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
        </motion.button>

        {/* Sections */}
        {SETTINGS_SECTIONS.map((section, sectionIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-4">
              {section.title}
            </h3>
            <div className="bg-secondary/20 rounded-[2rem] border border-border/50 overflow-hidden backdrop-blur-sm">
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-4 p-5 hover:bg-primary/5 transition-all active:bg-primary/10 cursor-pointer ${
                    idx !== section.items.length - 1
                      ? "border-b border-border/50"
                      : ""
                  }`}
                >
                  <div className="h-10 w-10 rounded-2xl bg-secondary/50 flex items-center justify-center text-foreground/80 shadow-sm">
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.label === "Notifications" ||
                    item.label === "Appearance" ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={
                            item.label === "Notifications"
                              ? settings.notifications
                              : settings.darkMode
                          }
                          onCheckedChange={item.action}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                          {item.value}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground opacity-50"
                        />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout Button (Mobile) */}
        <div className="pt-8">
          <Button
            variant="ghost"
            className="w-full h-16 rounded-[2rem] bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-black text-sm uppercase tracking-widest gap-3 active-scale transition-all shadow-sm"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Logout from Void
          </Button>
          <p className="text-center text-[10px] text-muted-foreground mt-6 font-medium opacity-50">
            VOID VERSION 2.1.0 • SHADOW PROTOCOL ACTIVE
          </p>
        </div>
      </main>
    </div>
  );
}
