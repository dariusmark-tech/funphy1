import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Account created — signing you in!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--neon)]/20 blur-[120px]" />
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative z-10 w-full max-w-sm rounded-2xl p-8"
      >
        <h1 className="text-2xl font-black">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin" ? "Continue your physics climb." : "Start your physics climb today."}
        </p>

        <button
          onClick={google}
          className="mt-6 w-full rounded-lg border border-border bg-background/40 px-4 py-2.5 text-sm font-medium hover:border-[var(--neon)]"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/40"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/40"
          />
          <button
            disabled={busy}
            className="w-full rounded-lg bg-[var(--neon)] px-4 py-2.5 font-bold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50"
          >
            {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-[var(--neon)]"
        >
          {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
}
