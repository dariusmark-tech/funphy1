import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { Lock, CheckCircle2, ChevronRight, Rocket, Zap, Battery, Target, RotateCw, Gem, Trophy } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  beforeLoad: async () => {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) throw redirect({ to: "/login" });
    const { data: prof } = await supabase
      .from("profiles")
      .select("placement_completed")
      .eq("id", s.session.user.id)
      .maybeSingle();
    if (prof && !prof.placement_completed) throw redirect({ to: "/placement" });
  },
  component: Dashboard,
});

const ICONS: Record<string, any> = {
  rocket: Rocket, zap: Zap, battery: Battery, target: Target, "rotate-cw": RotateCw,
};

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: modules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });
  const { data: quest } = useQuery({
    queryKey: ["daily-quest"],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_quests")
        .select("*")
        .order("active_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  if (!profile) return <DashSkeleton />;

  const xpInLevel = profile.xp % 500;
  const level = Math.floor(profile.xp / 500) + 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {/* Hero status card */}
        <div className="glass relative overflow-hidden rounded-2xl p-6 md:col-span-2">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--neon)]/15 blur-3xl" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back, player</p>
          <h1 className="mt-1 text-3xl font-black">
            {profile.display_name || "Player"}
          </h1>
          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-bold">Level {level}</span>
              <span className="text-muted-foreground">{xpInLevel} / 500 XP</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xpInLevel / 500) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--neon)] to-[var(--cyan)] shadow-[var(--shadow-glow)]"
              />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Physics Score" value={`${profile.physics_score}/200`} color="var(--neon)" />
            <Stat label="Streak" value={`${profile.streak}d`} color="var(--streak)" />
            <Stat label="League" value={profile.league} color="var(--cyan)" />
          </div>
        </div>

        {/* Daily Quest */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" /> Daily Quest
          </div>
          <h3 className="mt-2 text-lg font-bold">{quest?.description || "Earn 30 XP today"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Reward: <span className="text-[var(--gem)] font-semibold inline-flex items-center gap-1">
              <Gem className="h-3.5 w-3.5" />{quest?.reward_gems ?? 10} gems
            </span>
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-[var(--xp)]"
              style={{ width: `${Math.min(100, ((profile.xp % (quest?.target_xp || 30)) / (quest?.target_xp || 30)) * 100)}%` }}
            />
          </div>
          <Link
            to="/practice"
            className="mt-4 block rounded-full bg-[var(--neon)] py-2 text-center text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-transform"
          >
            Practice now
          </Link>
        </div>
      </motion.div>

      {/* Module tree */}
      <h2 className="mt-10 text-xl font-black">Mechanics path</h2>
      <p className="text-sm text-muted-foreground">Unlock modules as you climb.</p>

      <div className="mt-6 space-y-4">
        {modules?.map((m, i) => {
          const Icon = ICONS[m.icon || "rocket"] || Rocket;
          const unlocked = i === 0 || profile.physics_score >= i * 30;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={unlocked ? "/modules/$id" : "/dashboard"}
                params={{ id: m.id }}
                className={`glass group flex items-center gap-4 rounded-2xl p-5 transition-all ${
                  unlocked ? "hover:border-[var(--neon)]/60 hover:shadow-[var(--shadow-glow)]" : "opacity-50 cursor-not-allowed pointer-events-none"
                }`}
              >
                <div
                  className="grid h-14 w-14 place-items-center rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${m.color || "#39FF14"}30, ${m.color || "#39FF14"}10)`,
                    border: `1px solid ${m.color || "#39FF14"}50`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: m.color || "#39FF14" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Module {m.order_index}</span>
                    {unlocked ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--neon)]" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold">{m.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{m.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-black" style={{ color }}>{value}</div>
    </div>
  );
}

function DashSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <div className="glass h-48 animate-pulse rounded-2xl" />
      <div className="glass h-20 animate-pulse rounded-2xl" />
      <div className="glass h-20 animate-pulse rounded-2xl" />
    </div>
  );
}
