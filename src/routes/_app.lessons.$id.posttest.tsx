import { createFileRoute, useRouter, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRefreshProfile } from "@/hooks/use-profile";
import { ChevronLeft, CheckCircle2, XCircle, ArrowRight, Trophy, RotateCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/lessons/$id/posttest")({
  component: PosttestPage,
});

type Question = {
  id: string;
  question_text: string;
  choices: string[];
  correct_answer: string;
  order_index: number;
};

function PosttestPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const { user } = useAuth();
  const refresh = useRefreshProfile();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const { data: lesson } = useQuery({
    queryKey: ["lesson-mini", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id, title, module_id, order_index")
        .eq("id", id)
        .single();
      return data;
    },
  });

  const { data: quiz } = useQuery({
    queryKey: ["lesson-quiz", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("*, questions(*)")
        .eq("lesson_id", id)
        .maybeSingle();
      return data;
    },
  });

  const { data: siblings } = useQuery({
    queryKey: ["posttest-siblings", lesson?.module_id],
    enabled: !!lesson?.module_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id, title, order_index")
        .eq("module_id", lesson!.module_id)
        .order("order_index");
      return data ?? [];
    },
  });

  const questions: Question[] = ((quiz?.questions ?? []) as any[]).sort(
    (a, b) => a.order_index - b.order_index,
  );

  const passing = quiz?.passing_score ?? 70;

  const submit = useMutation({
    mutationFn: async () => {
      let correct = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correct_answer) correct += 1;
      });
      const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;
      const passed = pct >= passing;

      if (user && lesson) {
        await supabase.from("user_progress").upsert(
          {
            user_id: user.id,
            lesson_id: lesson.id,
            module_id: lesson.module_id,
            completed: passed,
            completed_at: passed ? new Date().toISOString() : null,
            posttest_score: pct,
            posttest_passed: passed,
          },
          { onConflict: "user_id,lesson_id" } as any,
        );
        if (passed) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("xp, gems")
            .eq("id", user.id)
            .single();
          await supabase
            .from("profiles")
            .update({ xp: (prof?.xp ?? 0) + 25, gems: (prof?.gems ?? 0) + 5 })
            .eq("id", user.id);
        }
      }
      return { correct, pct, passed };
    },
    onSuccess: (res) => {
      setScore(res.pct);
      setSubmitted(true);
      if (res.passed) {
        toast.success(`+25 XP · +5 Gems`, { description: `Passed with ${res.pct}%!` });
        refresh();
      } else {
        toast.error(`Score ${res.pct}%`, { description: `Need ${passing}% to pass.` });
      }
    },
  });

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  const idx = siblings?.findIndex((s) => s.id === id) ?? -1;
  const next = siblings && idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const passed = submitted && score >= passing;

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-4 pb-28">
      <button
        onClick={() => router.history.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Trophy className="h-3 w-3" /> Posttest · 10 items
      </div>
      <h1 className="mt-1 text-2xl font-black leading-tight">{lesson?.title ?? "Posttest"}</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Pass with {passing}% or higher to complete this lesson.
      </p>

      {!quiz || questions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
          Posttest not available yet.
        </div>
      ) : (
        <>
          <ol className="mt-6 space-y-4">
            {questions.map((q, i) => {
              const picked = answers[q.id];
              return (
                <li key={q.id} className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="flex gap-2 text-sm font-semibold">
                    <span className="text-primary">{i + 1}.</span>
                    <span>{q.question_text}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {q.choices.map((c) => {
                      const isPicked = picked === c;
                      const isCorrect = submitted && c === q.correct_answer;
                      const isWrong = submitted && isPicked && c !== q.correct_answer;
                      return (
                        <button
                          key={c}
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: c }))}
                          className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                            isCorrect
                              ? "border-emerald-500 bg-emerald-500/10"
                              : isWrong
                                ? "border-rose-500 bg-rose-500/10"
                                : isPicked
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          {submitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                          {submitted && isWrong && <XCircle className="h-4 w-4 text-rose-600" />}
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ol>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Your score</div>
              <div className={`mt-1 text-4xl font-black ${passed ? "text-emerald-600" : "text-rose-600"}`}>
                {score}%
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {passed ? "Great work — lesson completed!" : `You need ${passing}% to pass. Try again!`}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={reset}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-3 text-sm font-bold"
                >
                  <RotateCw className="h-4 w-4" /> Retry
                </button>
                {passed ? (
                  next ? (
                    <button
                      onClick={() =>
                        navigate({ to: "/lessons/$id", params: { id: next.id } })
                      }
                      className="inline-flex flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
                    >
                      Next Lesson <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link
                      to="/modules/$id"
                      params={{ id: lesson!.module_id }}
                      className="inline-flex flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
                    >
                      Finish Module <CheckCircle2 className="h-4 w-4" />
                    </Link>
                  )
                ) : null}
              </div>
            </div>
          ) : (
            <button
              onClick={() => submit.mutate()}
              disabled={!allAnswered || submit.isPending}
              className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {allAnswered ? "Submit Posttest" : `Answer all ${questions.length} questions`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
