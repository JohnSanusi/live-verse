"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Loader } from "./Loader";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Allow access to auth pages
    if (pathname === "/login" || pathname === "/signup") {
      if (isAuthenticated) {
        router.push("/");
      }
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loader while initializing
  if (isLoading) {
    return <Loader />;
  }

  // Show nothing while redirecting unauthenticated users
  if (!isAuthenticated && pathname !== "/login" && pathname !== "/signup") {
    return null;
  }

  // Don't show main layout on auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  return <>{children}</>;
}
