import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/_app/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const [filter, setFilter] = useState("");
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,display_name,xp,league,last_active_date,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filtered = users?.filter(
    (u) =>
      !filter ||
      u.display_name?.toLowerCase().includes(filter.toLowerCase()) ||
      u.email?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by name or email…"
        className="w-full rounded-full border border-border bg-background/40 px-4 py-2 text-sm outline-none focus:border-[var(--neon)]/60"
      />
      <p className="text-xs text-muted-foreground">{filtered?.length ?? 0} registered users</p>
      <ul className="space-y-2">
        {filtered?.map((u) => {
          const active =
            u.last_active_date && new Date(u.last_active_date) >= new Date(Date.now() - 7 * 86400000);
          const level = Math.floor((u.xp ?? 0) / 500) + 1;
          return (
            <li key={u.id} className="glass rounded-2xl p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{u.display_name || "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active ? "bg-[var(--neon)]/15 text-[var(--neon)]" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>Joined {new Date(u.created_at).toLocaleDateString()}</span>
                <span>·</span>
                <span>{u.league}</span>
                <span>·</span>
                <span>Lvl {level}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
