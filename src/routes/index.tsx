import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Rocket, Zap, Trophy, Brain, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--neon)]/20 blur-[120px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="relative h-9 w-9">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--neon)] to-[var(--cyan)] animate-pulse-glow" />
            <div className="absolute inset-[2px] grid place-items-center rounded-[10px] bg-background">
              <span className="text-sm font-black gradient-text">PC</span>
            </div>
          </div>
          <span className="text-lg font-black">
            Physi<span className="gradient-text">Climb</span>
          </span>
        </div>
        <Link
          to="/login"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-[var(--neon)] hover:text-[var(--neon)] transition-colors"
        >
          Sign in
        </Link>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--neon)]/40 bg-[var(--neon)]/5 px-4 py-1 text-xs font-medium text-[var(--neon)]">
            <Zap className="h-3 w-3" /> Mechanics Mastery, gamified
          </span>
          <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
            Master physics like<br />
            you <span className="gradient-text">play a game</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Learn kinematics, dynamics, energy and momentum through interactive mini-games,
            daily streaks, and a leaderboard that rewards mastery — not memorization.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--neon)] px-6 py-3 font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-transform"
            >
              Start free <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="rounded-full border border-border px-6 py-3 font-medium hover:border-[var(--neon)] transition-colors"
            >
              See how it works
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mt-16 grid max-w-4xl gap-4 md:grid-cols-3"
          id="features"
        >
          {[
            { icon: Rocket, title: "5 Mini-Games", body: "Vector Racer, Force Builder, Kinematics Jump and more." },
            { icon: Brain, title: "Adaptive Lessons", body: "Quizzes adjust to where you struggle — friction, energy, anything." },
            { icon: Trophy, title: "Weekly League", body: "Climb from Bronze to Diamond as you learn." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 text-left">
              <f.icon className="h-6 w-6 text-[var(--neon)]" />
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
