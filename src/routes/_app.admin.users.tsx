import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/_app/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const [filter, setFilter] = useState("");

  const { data: myCode } = useQuery({
    queryKey: ["my-prof-code"],
    queryFn: async () => {
      const { data } = await supabase.rpc("my_professor_code");
      return (data as string | null) ?? "";
    },
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users", myCode],
    enabled: myCode !== undefined,
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select("id,email,display_name,xp,league,last_active_date,created_at,school_id,linked_professor_code")
        .order("created_at", { ascending: false })
        .limit(500);
      if (myCode) q = q.eq("linked_professor_code", myCode);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const ids = users?.map((u) => u.id) ?? [];
  const { data: progress } = useQuery({
    queryKey: ["admin-progress", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("user_id,completed,posttest_passed,posttest_score")
        .in("user_id", ids);
      if (error) throw error;
      const map = new Map<string, { completed: number; passed: number; avg: number }>();
      for (const id of ids) map.set(id, { completed: 0, passed: 0, avg: 0 });
      const sums = new Map<string, { sum: number; n: number }>();
      for (const row of data ?? []) {
        const m = map.get(row.user_id)!;
        if (row.completed) m.completed++;
        if (row.posttest_passed) m.passed++;
        if (row.posttest_score != null) {
          const s = sums.get(row.user_id) ?? { sum: 0, n: 0 };
          s.sum += row.posttest_score;
          s.n++;
          sums.set(row.user_id, s);
        }
      }
      for (const [id, s] of sums) {
        const m = map.get(id)!;
        m.avg = Math.round(s.sum / s.n);
      }
      return map;
    },
  });

  const filtered = users?.filter(
    (u) =>
      !filter ||
      u.display_name?.toLowerCase().includes(filter.toLowerCase()) ||
      u.email?.toLowerCase().includes(filter.toLowerCase()) ||
      u.school_id?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      {myCode ? (
        <div className="glass rounded-2xl p-3 text-xs">
          <span className="text-muted-foreground">Your Professor Code:</span>{" "}
          <span className="font-black text-[var(--neon)]">{myCode}</span>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Share this code with your students so they can link to you.
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl p-3 text-xs text-muted-foreground">
          You don't have a professor code set. Showing all students.
        </div>
      )}
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by name, email, or school ID…"
        className="w-full rounded-full border border-border bg-background/40 px-4 py-2 text-sm outline-none focus:border-[var(--neon)]/60"
      />
      <p className="text-xs text-muted-foreground">{filtered?.length ?? 0} students</p>
      <ul className="space-y-2">
        {filtered?.map((u) => {
          const active =
            u.last_active_date && new Date(u.last_active_date) >= new Date(Date.now() - 7 * 86400000);
          const level = Math.floor((u.xp ?? 0) / 500) + 1;
          const p = progress?.get(u.id);
          return (
            <li key={u.id} className="glass rounded-2xl p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{u.display_name || "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  {u.school_id && (
                    <p className="truncate text-[11px] text-muted-foreground">ID: {u.school_id}</p>
                  )}
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
                <span>·</span>
                <span>{u.xp ?? 0} XP</span>
              </div>
              {p && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="rounded-lg bg-background/40 py-1">
                    <div className="font-black text-[var(--neon)]">{p.completed}</div>
                    <div className="text-muted-foreground">Lessons</div>
                  </div>
                  <div className="rounded-lg bg-background/40 py-1">
                    <div className="font-black text-[var(--neon)]">{p.passed}</div>
                    <div className="text-muted-foreground">Passed</div>
                  </div>
                  <div className="rounded-lg bg-background/40 py-1">
                    <div className="font-black text-[var(--neon)]">{p.avg || "—"}</div>
                    <div className="text-muted-foreground">Avg %</div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
