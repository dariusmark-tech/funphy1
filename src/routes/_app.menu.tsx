import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  Bell,
  Volume2,
  Palette,
  Info,
  RefreshCw,
  LogOut,
  Trash2,
  ShieldCheck,
  ShoppingBag,
  Dumbbell,
  User as UserIcon,
} from "lucide-react";

export const Route = createFileRoute("/_app/menu")({
  component: MenuPage,
});

function MenuPage() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const router = useRouter();
  const [appearance, setAppearance] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-2xl font-black">Menu Settings</h1>

      <div className="glass mt-4 rounded-2xl p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Player</p>
        <h2 className="mt-1 text-lg font-bold">{profile?.display_name || "Player"}</h2>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>

      <div className="glass mt-4 divide-y divide-border/60 rounded-2xl">
        <Toggle icon={Palette} label="Appearance (Dark)" value={appearance} onChange={setAppearance} />
        <Toggle icon={Bell} label="Notifications" value={notifications} onChange={setNotifications} />
        <Toggle icon={Volume2} label="Sounds" value={sounds} onChange={setSounds} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Link to="/profile" className="glass flex flex-col items-center gap-1 rounded-2xl p-3 text-xs">
          <UserIcon className="h-4 w-4" /> Profile
        </Link>
        <Link to="/practice" className="glass flex flex-col items-center gap-1 rounded-2xl p-3 text-xs">
          <Dumbbell className="h-4 w-4" /> Practice
        </Link>
        <Link to="/shop" className="glass flex flex-col items-center gap-1 rounded-2xl p-3 text-xs">
          <ShoppingBag className="h-4 w-4" /> Shop
        </Link>
      </div>

      {isAdmin && (
        <Link
          to="/admin"
          className="glass mt-4 flex items-center gap-3 rounded-2xl p-4 hover:border-[var(--neon)]/60"
        >
          <ShieldCheck className="h-5 w-5 text-[var(--neon)]" />
          <div className="flex-1">
            <p className="text-sm font-bold">Admin Dashboard</p>
            <p className="text-xs text-muted-foreground">Manage users, content & analytics</p>
          </div>
        </Link>
      )}

      <div className="glass mt-4 divide-y divide-border/60 rounded-2xl">
        <Row icon={Info} label="Credits" />
        <Row icon={RefreshCw} label="Switch Account" onClick={async () => { await signOut(); router.navigate({ to: "/login" }); }} />
        <Row
          icon={LogOut}
          label="Log Out"
          onClick={async () => {
            await signOut();
            router.navigate({ to: "/" });
          }}
        />
        <Row icon={Trash2} label="Delete Account" danger />
      </div>

      <p className="mt-6 text-center text-[10px] text-muted-foreground">
        Batch 2026 AP4 Group 11 · All rights reserved
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

function Row({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted/30 ${
        danger ? "text-destructive" : ""
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
    </button>
  );
}
