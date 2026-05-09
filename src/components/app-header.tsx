import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { HeartsDisplay, StreakBadge, XpBadge, GemBadge } from "./stats";

export function AppHeader() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/70">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-3 py-2.5">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--neon)] to-[var(--cyan)] animate-pulse-glow" />
            <div className="absolute inset-[2px] grid place-items-center rounded-[10px] bg-background">
              <span className="text-[9px] font-black gradient-text">FP</span>
            </div>
          </div>
          <span className="text-sm font-black tracking-tight">
            FUN<span className="gradient-text">PHY</span>
          </span>
        </Link>

        {user && profile && (
          <div className="flex items-center gap-1.5">
            <StreakBadge streak={profile.streak} />
            <XpBadge xp={profile.xp} />
            <GemBadge gems={profile.gems} />
            <HeartsDisplay count={profile.hearts} />
          </div>
        )}
      </div>
    </header>
  );
}
