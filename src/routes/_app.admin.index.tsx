import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString("en-US", { month: "long" });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstWeekday).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ count: total }, { count: active }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_active_date", new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)),
      ]);
      return { total: total ?? 0, active: active ?? 0 };
    },
  });

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Calendar</p>
          <h2 className="mt-1 text-lg font-black">
            {monthName} {year}
          </h2>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
          {cells.map((d, i) => (
            <div
              key={i}
              className={`aspect-square grid place-items-center rounded-md ${
                d === today.getDate()
                  ? "bg-[var(--neon)] font-black text-primary-foreground"
                  : d
                    ? "text-foreground"
                    : "text-transparent"
              }`}
            >
              {d ?? "·"}
            </div>
          ))}
        </div>
        <div className="mt-3 text-center text-xs text-muted-foreground">
          {today.toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "long" })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Registered Users" value={stats?.total ?? "—"} />
        <Stat label="Active (7d)" value={stats?.active ?? "—"} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-black text-[var(--neon)]">{value}</div>
    </div>
  );
}
