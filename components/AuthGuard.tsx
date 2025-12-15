"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
  }, [isAuthenticated, pathname, router]);

  // Show loader while checking auth for protected routes
  if (!isAuthenticated && pathname !== "/login" && pathname !== "/signup") {
    return null;
  }

  // Don't show main layout on auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  return <>{children}</>;
}
