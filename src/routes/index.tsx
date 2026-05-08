import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Atom, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Opening,
});

function Opening() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--neon)]/20 blur-[140px]" />

      {/* orbiting atoms */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <div className="relative h-[360px] w-[360px] rounded-full border border-[var(--neon)]/30">
          <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[var(--neon)] shadow-[var(--shadow-glow)]" />
        </div>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: -360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        <div className="relative h-[260px] w-[260px] rounded-full border border-[var(--cyan)]/30">
          <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--cyan)] shadow-[var(--shadow-glow)]" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--neon)]/40 bg-[var(--neon)]/5 px-4 py-1 text-xs font-medium text-[var(--neon)]">
          <Sparkles className="h-3 w-3" /> A physics adventure
        </span>
        <div className="mt-6 inline-flex items-center gap-3">
          <Atom className="h-12 w-12 text-[var(--neon)] animate-pulse-glow" />
          <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
            FUN<span className="gradient-text">PHY1</span>
          </h1>
        </div>
        <p className="mt-4 text-lg font-bold text-foreground/80">Fundamental Physics 1</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Step into the lab, take the assessment, then journey through Beginner, Intermediate, and
          Advance levels to uncover the storyline conclusion.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--neon)] px-7 py-3 font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.03] transition-transform"
          >
            Press Start <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
