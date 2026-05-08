import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { HeartsDisplay, StreakBadge, XpBadge, GemBadge } from "./stats";
import { ShoppingBag, LogOut, User as UserIcon, Dumbbell } from "lucide-react";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="relative h-9 w-9">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--neon)] to-[var(--cyan)] animate-pulse-glow" />
            <div className="absolute inset-[2px] grid place-items-center rounded-[10px] bg-background">
              <span className="text-sm font-black gradient-text">PC</span>
            </div>
          </div>
          <span className="text-lg font-black tracking-tight">
            Physi<span className="gradient-text">Climb</span>
          </span>
        </Link>

        {user && profile && (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <StreakBadge streak={profile.streak} />
              <XpBadge xp={profile.xp} />
              <GemBadge gems={profile.gems} />
            </div>
            <HeartsDisplay count={profile.hearts} />
            <Link
              to="/practice"
              className="glass hidden rounded-full p-2 hover:text-[var(--neon)] md:block"
              title="Practice Hub"
            >
              <Dumbbell className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="glass rounded-full p-2 hover:text-[var(--neon)]" title="Shop">
              <ShoppingBag className="h-4 w-4" />
            </Link>
            <Link to="/profile" className="glass rounded-full p-2 hover:text-[var(--neon)]" title="Profile">
              <UserIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={async () => {
                await signOut();
                router.navigate({ to: "/" });
              }}
              className="glass rounded-full p-2 hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
