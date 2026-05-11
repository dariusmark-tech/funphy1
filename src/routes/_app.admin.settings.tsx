import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { Bell, Volume2, Palette, RefreshCw, LogOut } from "lucide-react";

export const Route = createFileRoute("/_app/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { signOut } = useAuth();
  const router = useRouter();
  const { appearance, notifications, sounds, setAppearance, setNotifications, setSounds, playBeep, notify } =
    useSettings();

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-slate-300 bg-white p-4 text-center shadow-sm">
        <h2 className="text-lg font-black italic text-slate-900">Settings</h2>
      </div>

      <div className="divide-y divide-slate-200 rounded-2xl border-2 border-slate-300 bg-white shadow-sm">
        <Toggle
          icon={Palette}
          label="Appearance (Dark)"
          value={appearance === "dark"}
          onChange={(v) => setAppearance(v ? "dark" : "light")}
        />
        <Toggle
          icon={Bell}
          label="Notifications"
          value={notifications}
          onChange={(v) => {
            setNotifications(v);
            if (v) notify("Notifications enabled", "You'll get updates here.");
          }}
        />
        <Toggle
          icon={Volume2}
          label="Sounds"
          value={sounds}
          onChange={(v) => {
            setSounds(v);
            if (v) setTimeout(playBeep, 50);
          }}
        />
      </div>

      <button
        onClick={async () => {
          await signOut();
          router.navigate({ to: "/login" });
        }}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50"
      >
        <RefreshCw className="h-4 w-4" /> Switch Account
      </button>
      <button
        onClick={async () => {
          await signOut();
          router.navigate({ to: "/" });
        }}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-rose-300 bg-white px-4 py-3 text-sm font-bold text-rose-600 shadow-sm hover:bg-rose-50"
      >
        <LogOut className="h-4 w-4" /> Log Out
      </button>

      <p className="pt-2 text-center text-[10px] italic text-slate-500">
        Batch 2026 AP4 Group 11 | All right reserved
      </p>
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
      <Icon className="h-4 w-4 text-slate-600" />
      <span className="flex-1 text-sm font-medium italic text-slate-800">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-[var(--neon)]" : "bg-slate-300"
        }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
