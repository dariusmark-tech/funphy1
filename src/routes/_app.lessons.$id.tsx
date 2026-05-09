import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRefreshProfile } from "@/hooks/use-profile";
import { ChevronLeft, CheckCircle2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/lessons/$id")({
  component: LessonReader,
});

function LessonReader() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const refresh = useRefreshProfile();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*, modules(title, order_index, color)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["lesson-progress", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user!.id)
        .eq("lesson_id", id)
        .maybeSingle();
      return data;
    },
  });

  const complete = useMutation({
    mutationFn: async () => {
      if (!user || !lesson) return;
      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          module_id: lesson.module_id,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" } as any
      );
      const { data: prof } = await supabase
        .from("profiles")
        .select("xp, gems")
        .eq("id", user.id)
        .single();
      await supabase
        .from("profiles")
        .update({ xp: (prof?.xp ?? 0) + 10, gems: (prof?.gems ?? 0) + 2 })
        .eq("id", user.id);
    },
    onSuccess: () => {
      toast.success("+10 XP · +2 Gems", { description: "Lesson complete!" });
      refresh();
    },
  });

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <button
        onClick={() => router.history.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      {isLoading || !lesson ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-muted/40" />
      ) : (
        <>
          <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            {(lesson as any).modules?.title} · Lesson {lesson.order_index}
          </div>
          <h1 className="mt-1 text-2xl font-black leading-tight">{lesson.title}</h1>

          <article className="mt-5 whitespace-pre-wrap rounded-2xl border border-border bg-card/60 p-5 text-sm leading-relaxed text-foreground/90">
            {lesson.text_content || "Content coming soon."}
          </article>

          <div className="mt-5 flex gap-2">
            <Link
              to="/modules/$id"
              params={{ id: lesson.module_id }}
              className="flex-1 rounded-full border border-border bg-background px-4 py-3 text-center text-sm font-bold"
            >
              Back to Module
            </Link>
            <button
              onClick={() => complete.mutate()}
              disabled={complete.isPending || !!progress?.completed}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {progress?.completed ? "Completed" : "Mark Complete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
