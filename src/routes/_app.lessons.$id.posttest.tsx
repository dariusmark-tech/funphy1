import { createFileRoute, useRouter, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRefreshProfile } from "@/hooks/use-profile";
import {
  ChevronLeft,
  ArrowRight,
  Trophy,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
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

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function PosttestPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const { user } = useAuth();
  const refresh = useRefreshProfile();

  const [step, setStep] = useState(0); // current question index
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

  const questions: Question[] = useMemo(
    () =>
      ((quiz?.questions ?? []) as any[])
        .slice()
        .sort((a, b) => a.order_index - b.order_index),
    [quiz],
  );

  const passing = quiz?.passing_score ?? 70;
  const total = questions.length;
  const current = questions[step];
  const picked = current ? answers[current.id] : undefined;

  const submit = useMutation({
    mutationFn: async () => {
      let correct = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correct_answer) correct += 1;
      });
      const pct = total ? Math.round((correct / total) * 100) : 0;
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

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setStep(0);
  };

  const handleNext = () => {
    if (step < total - 1) setStep(step + 1);
    else submit.mutate();
  };

  const idx = siblings?.findIndex((s) => s.id === id) ?? -1;
  const next = siblings && idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const passed = submitted && score >= passing;

  // ===== Results screen =====
  if (submitted) {
    const correctCount = questions.reduce(
      (n, q) => n + (answers[q.id] === q.correct_answer ? 1 : 0),
      0,
    );
    const level = score >= 90 ? "Advanced" : score >= 70 ? "Intermediate" : "Beginner";
    return (
      <div className="mx-auto max-w-md px-4 py-6 pb-28">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-center text-xl font-black italic">Posttest Results</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {lesson?.title}
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <div>
              <span className="font-bold">Score: </span>
              <span className={passed ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                {correctCount}/{total} ({score}%)
              </span>
            </div>
            <div>
              <span className="font-bold">Level: </span>
              {level}
            </div>
            <div>
              <span className="font-bold">Feedback: </span>
              {passed
                ? "Great work! You've mastered this lesson and unlocked the next one."
                : `You need ${passing}% to pass. Review the lesson and try again.`}
            </div>
            <div>
              <span className="font-bold">Recommended: </span>
              {passed
                ? "Continue to the next lesson to keep building your knowledge."
                : "Re-watch the video and review the key takeaways before retrying."}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={reset}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-3 text-sm font-bold"
            >
              <RotateCw className="h-4 w-4" /> Retry
            </button>
            {passed ? (
              next ? (
                <button
                  onClick={() => navigate({ to: "/lessons/$id", params: { id: next.id } })}
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
            ) : (
              <Link
                to="/lessons/$id"
                params={{ id }}
                className="inline-flex flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                Review Lesson
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== Quiz screen =====
  return (
    <div className="mx-auto max-w-md px-4 py-4 pb-28">
      <button
        onClick={() => router.history.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Trophy className="h-3 w-3" /> Posttest · {total} items
      </div>
      <h1 className="mt-1 text-xl font-black leading-tight">
        Answer the {total} following physics questions
      </h1>

      {!quiz || total === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
          Posttest not available yet.
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-primary" : i === step ? "bg-accent" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Question {step + 1} of {total}
          </p>

          {/* Question card */}
          <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex gap-2 text-base font-semibold leading-snug">
              <span className="text-primary">{step + 1}.</span>
              <span>{current.question_text}</span>
            </div>

            <div className="mt-5 space-y-3">
              {current.choices.map((c, i) => {
                const letter = LETTERS[i] ?? String(i + 1);
                const isPicked = picked === c;
                return (
                  <button
                    key={c}
                    onClick={() =>
                      setAnswers((a) => ({ ...a, [current.id]: c }))
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm transition-colors ${
                      isPicked
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        isPicked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav buttons */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button
              onClick={handleNext}
              disabled={!picked || submit.isPending}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm disabled:opacity-50"
            >
              {step === total - 1 ? "Submit" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
