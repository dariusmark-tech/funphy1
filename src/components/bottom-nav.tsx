import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, Gamepad2, BookOpen, Menu as MenuIcon } from "lucide-react";

const ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/game-map", label: "Map", icon: Map },
  { to: "/mini-games", label: "Mini Games", icon: Gamepad2 },
  { to: "/learning", label: "Learning", icon: BookOpen },
  { to: "/menu", label: "Menu", icon: MenuIcon },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = path === to || (to !== "/dashboard" && path.startsWith(to));
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors ${
                  active ? "text-[var(--neon)]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_var(--neon)]" : ""}`} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
