import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Play, BookOpen, Sparkles, Map } from "lucide-react";

export const Route = createFileRoute("/_app/game-map")({
  component: GameMap,
});

type Tier = {
  key: "beginner" | "intermediate" | "advance";
  label: string;
  blurb: string;
  color: string;
  unlocked: boolean;
};

const TIERS: Tier[] = [
  {
    key: "beginner",
    label: "Beginner",
    blurb: "Easy mode. Learn the ropes of motion, force and energy.",
    color: "var(--neon)",
    unlocked: true,
  },
  {
    key: "intermediate",
    label: "Intermediate",
    blurb: "Locked — clear Beginner to unlock harder mechanics puzzles.",
    color: "var(--cyan)",
    unlocked: false,
  },
  {
    key: "advance",
    label: "Advance",
    blurb: "Locked — final challenges leading to the storyline conclusion.",
    color: "var(--xp)",
    unlocked: false,
  },
];

function GameMap() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative overflow-hidden rounded-2xl p-6"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--neon)]/15 blur-3xl" />
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Map className="h-3.5 w-3.5" /> Mini Map
        </div>
        <h1 className="mt-1 text-3xl font-black">Player path: Beginner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every player starts at Beginner. Clear a tier to unlock the next.
        </p>
      </motion.div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {TIERS.map((t, i) => (
          <motion.div
            key={t.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass rounded-2xl p-5 ${t.unlocked ? "" : "opacity-60"}`}
            style={t.unlocked ? { boxShadow: `0 0 0 1px ${t.color}55` } : undefined}
          >
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: `${t.color}22`, color: t.color }}
              >
                {t.label}
              </span>
              {t.unlocked ? (
                <Sparkles className="h-4 w-4" style={{ color: t.color }} />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <h3 className="mt-3 text-xl font-black">{t.label} mode</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
            {t.unlocked && (
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-2.5 text-left text-sm font-medium hover:border-[var(--neon)]/60"
                >
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Tutorial
                  </span>
                  <span className="text-xs text-muted-foreground">Easy</span>
                </button>
                <Link
                  to="/practice"
                  className="flex items-center justify-between rounded-xl bg-[var(--neon)] px-4 py-2.5 text-left text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.01] transition-transform"
                >
                  <span className="inline-flex items-center gap-2">
                    <Play className="h-4 w-4" /> Start game
                  </span>
                  <span className="text-xs opacity-80">Easy mode</span>
                </Link>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="glass mt-8 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Storyline</p>
        <h2 className="mt-1 text-xl font-black">The journey ahead</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Conquer all three tiers to unlock the storyline conclusion — a final cinematic ending
          that ties together motion, force, energy and momentum.
        </p>
      </div>
    </div>
  );
}
