import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2, Lock } from "lucide-react";

export const Route = createFileRoute("/_app/mini-games")({
  component: MiniGames,
});

const GAMES = [
  { name: "Vector Racer", color: "var(--neon)", unlocked: true },
  { name: "Force Builder", color: "var(--cyan)", unlocked: false },
  { name: "Kinematics Jump", color: "var(--xp)", unlocked: false },
  { name: "Momentum Crash", color: "var(--streak)", unlocked: false },
];

function MiniGames() {
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-2xl font-black">Mini Games</h1>
      <p className="text-sm text-muted-foreground">Quick physics challenges. Earn XP and gems.</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {GAMES.map((g, i) => (
          <button
            key={g.name}
            disabled={!g.unlocked}
            className={`glass flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl p-4 transition-transform ${
              g.unlocked ? "hover:scale-[1.02]" : "opacity-60"
            }`}
            style={g.unlocked ? { boxShadow: `inset 0 0 0 1px ${g.color}55` } : undefined}
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{ background: `${g.color}22`, border: `1px solid ${g.color}55` }}
            >
              {g.unlocked ? (
                <Gamepad2 className="h-7 w-7" style={{ color: g.color }} />
              ) : (
                <Lock className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Game {i + 1}</div>
              <div className="text-sm font-bold">{g.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
