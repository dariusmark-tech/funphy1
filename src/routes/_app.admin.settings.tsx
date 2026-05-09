import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Bell, Volume2, Palette, RefreshCw, LogOut } from "lucide-react";

export const Route = createFileRoute("/_app/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [a, setA] = useState(true);
  const [n, setN] = useState(true);
  const [s, setS] = useState(true);

  return (
    <div className="space-y-3">
      <div className="glass divide-y divide-border/60 rounded-2xl">
        <Toggle icon={Palette} label="Appearance" value={a} onChange={setA} />
        <Toggle icon={Bell} label="Notifications" value={n} onChange={setN} />
        <Toggle icon={Volume2} label="Sounds" value={s} onChange={setS} />
      </div>
      <button
        onClick={async () => {
          await signOut();
          router.navigate({ to: "/login" });
        }}
        className="glass flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm"
      >
        <RefreshCw className="h-4 w-4" /> Switch Account
      </button>
      <button
        onClick={async () => {
          await signOut();
          router.navigate({ to: "/" });
        }}
        className="glass flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-destructive"
      >
        <LogOut className="h-4 w-4" /> Log Out
      </button>
    </div>
  );
}

function Toggle({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: any;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-[var(--neon)]" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
