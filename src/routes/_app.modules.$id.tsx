import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, ChevronLeft, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_app/modules/$id")({
  component: ModuleDetail,
});

function ModuleDetail() {
  const { id } = Route.useParams();
  const { data: mod } = useQuery({
    queryKey: ["module", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  const { data: lessons } = useQuery({
    queryKey: ["lessons", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", id)
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[var(--neon)]">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>
      {mod && (
        <div className="mt-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Module {mod.order_index}</span>
          <h1 className="text-4xl font-black">{mod.title}</h1>
          <p className="mt-2 text-muted-foreground">{mod.description}</p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {lessons?.map((l, i) => (
          <div key={l.id} className="glass flex items-center gap-4 rounded-2xl p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--neon)]/10 text-[var(--neon)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Lesson {i + 1}</div>
              <h3 className="font-bold">{l.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{l.text_content}</p>
            </div>
            <button className="inline-flex items-center gap-1 rounded-full bg-[var(--neon)] px-4 py-2 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
              <Play className="h-3.5 w-3.5" /> Start
            </button>
          </div>
        ))}
        {lessons && lessons.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            More lessons coming soon for this module.
          </div>
        )}
      </div>
    </div>
  );
}
