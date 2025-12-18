"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Chrome,
  Apple,
  Send,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { EliteBadge } from "@/components/EliteBadge";

export default function LoginPage() {
  const router = useRouter();
  const { login, signInWithGoogle, signInWithApple } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay for premium feel
    await new Promise((r) => setTimeout(r, 1000));

    const errorMsg = await login(email, password);
    if (!errorMsg) {
      router.push("/");
    } else {
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow font-bold"
        style={{ animationDelay: "2s" }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Header/Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-secondary border border-white/10 mb-6 shadow-2xl overflow-hidden relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-indigo-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img
              src="/icon.png"
              alt="Logo"
              className="w-12 h-12 object-contain relative z-10"
            />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            Void<span className="text-primary italic">.</span>
          </h1>
          <p className="text-muted-foreground/60 text-sm uppercase tracking-[0.3em] font-bold">
            Welcome Back
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl shadow-black/50 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center tracking-wide"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black ml-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="email@void.elite"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-white/[0.05] border-white/10 rounded-2xl focus:ring-primary/50 text-white placeholder:text-muted-foreground/30 px-5"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black ml-1">
                Password
              </label>
              <div className="relative group">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-white/[0.05] border-white/10 rounded-2xl focus:ring-primary/50 text-white placeholder:text-muted-foreground/30 px-5 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 active-scale group transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Log In</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              )}
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
              <span className="bg-[#050505] px-4 text-muted-foreground/40">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-14 rounded-2xl border-white/10 hover:bg-white/5 active-scale flex items-center justify-center gap-2 bg-transparent text-white"
              onClick={signInWithGoogle}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.18-2.43c-.11-.41-.18-.84-.18-1.28z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span className="sm:inline text-xs font-bold uppercase tracking-wider">
                Google
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-14 rounded-2xl border-white/10 hover:bg-white/5 active-scale flex items-center justify-center gap-2 bg-transparent text-white"
              onClick={signInWithApple}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-79-115-31.7-191.8zM245.9 71.4c18.8-24.2 16.8-49.7 15.3-60.5-20.7 1.8-43.1 14.3-57.6 31.8-18 21.6-15.6 51.2-13.6 59.4 18.6 1.8 38.8-11.2 55.9-30.7z" />
              </svg>
              <span className="sm:inline text-xs font-bold uppercase tracking-wider">
                Apple
              </span>
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-muted-foreground/60 font-medium">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:text-primary/80 font-black tracking-wide"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none opacity-20">
        <p className="text-[10px] uppercase tracking-[1em] text-white/50 font-black">
          Powered by Void
        </p>
      </div>
    </div>
  );
}
