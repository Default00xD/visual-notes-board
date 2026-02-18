"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Simple user indicator placeholder; in a real app you'd
// fetch current user via Supabase and show avatar.

export function UserButton() {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Check current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-8 w-16 animate-pulse rounded-full bg-slate-700/50" />
    );
  }

  if (!user) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-primary/50"
        >
          <Link href="/login">Login</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      action="/auth/sign-out"
      method="post"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-primary/50"
      >
        Sign out
      </Button>
    </motion.form>
  );
}
