import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use placeholders ONLY on the server (build time) to prevent crashes.
// On the client, we want it to fail if vars are missing, rather than redirecting to a fake URL.
const isServer = typeof window === "undefined";
const url = supabaseUrl || (isServer ? "https://placeholder.supabase.co" : "");
const key = supabaseAnonKey || (isServer ? "placeholder-key" : "");

if (!url || !key) {
  throw new Error(
    "Supabase credentials missing! Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(url, key);
