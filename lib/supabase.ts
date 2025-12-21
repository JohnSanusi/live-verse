import { createClient } from "@supabase/supabase-js";

// Helper to strip quotes if user included them in env vars
const stripQuotes = (val?: string) => val?.replace(/^["']|["']$/g, "") || "";

const supabaseUrl = stripQuotes(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = stripQuotes(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Use placeholders ONLY on the server (build time) to prevent crashes.
const isServer = typeof window === "undefined";
const url = supabaseUrl || (isServer ? "https://placeholder.supabase.co" : "");
const key = supabaseAnonKey || (isServer ? "placeholder-key" : "");

if (!url || !key) {
  throw new Error(
    "Supabase credentials missing! Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(url, key);
