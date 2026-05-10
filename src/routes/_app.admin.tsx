import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: async () => {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) throw redirect({ to: "/login" });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", s.session.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

const TABS: { to: any; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: Calendar, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="light mx-auto min-h-screen max-w-md bg-white px-4 py-6 text-slate-900">
      <p className="text-xs uppercase tracking-wider text-[var(--neon)]">Admin</p>
      <h1 className="text-2xl font-black">Welcome Admin</h1>

      <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-background/40 p-1.5">
        {TABS.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? path === to : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold ${
                active ? "bg-[var(--neon)]/15 text-[var(--neon)]" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}
