import { createFileRoute } from "@tanstack/react-router";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { Trophy, Flame, Zap, Award } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  if (!profile) return null;

  const stats = [
    { label: "Total XP", value: profile.xp.toLocaleString(), icon: Zap, color: "var(--xp)" },
    { label: "Lifetime streak", value: `${profile.max_streak}d`, icon: Flame, color: "var(--streak)" },
    { label: "Physics Score", value: `${profile.physics_score}/200`, icon: Award, color: "var(--neon)" },
    { label: "League", value: profile.league, icon: Trophy, color: "var(--cyan)" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="glass flex items-center gap-5 rounded-2xl p-6">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[var(--neon)] to-[var(--cyan)] text-3xl font-black text-primary-foreground">
          {(profile.display_name || profile.email || "?")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-black">{profile.display_name || "Player"}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <s.icon className="h-5 w-5" style={{ color: s.color }} />
            <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-xl font-black" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
