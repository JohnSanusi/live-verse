import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";

import { Loader } from "@/components/Loader";
import { AppProvider } from "@/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Live-Verse",
  description: "A modern social messaging platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-16 md:pb-0`}
      >
        <Loader />
        <AppProvider>
          <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <main className="flex-1 md:ml-64 w-full">
               <div className="max-w-3xl mx-auto w-full min-h-screen border-x border-border/50 shadow-2xl shadow-black">
                  {children}
               </div>
            </main>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
