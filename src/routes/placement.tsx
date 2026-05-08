import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { CheckCircle2, XCircle } from "lucide-react";

const QUESTIONS = [
  { q: "An object moves at constant velocity. Net force is…", a: ["Zero", "Constant non-zero", "Increasing", "Equal to weight"], correct: 0 },
  { q: "Acceleration units?", a: ["m/s", "m/s²", "kg·m/s", "N·s"], correct: 1 },
  { q: "Newton's 2nd law:", a: ["F = mv", "F = ma", "F = m/a", "F = m + a"], correct: 1 },
  { q: "Kinetic energy of a 2 kg object at 3 m/s?", a: ["6 J", "9 J", "12 J", "18 J"], correct: 1 },
  { q: "Two cars collide and stick. Conserved quantity:", a: ["Kinetic energy", "Velocity", "Momentum", "Mass only"], correct: 2 },
];

export const Route = createFileRoute("/placement")({
  beforeLoad: async () => {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) throw redirect({ to: "/login" });
    const { data: prof } = await supabase
      .from("profiles")
      .select("placement_completed")
      .eq("id", s.session.user.id)
      .maybeSingle();
    if (prof?.placement_completed) throw redirect({ to: "/dashboard" });
  },
  component: Placement,
});

function Placement() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[step];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
    setTimeout(async () => {
      if (step + 1 >= QUESTIONS.length) {
        setDone(true);
        const finalScore = score + (i === q.correct ? 1 : 0);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({
              placement_completed: true,
              physics_score: finalScore * 20,
              xp: finalScore * 10,
            })
            .eq("id", user.id);
        }
        toast.success(`Placement complete! ${finalScore}/${QUESTIONS.length} correct.`);
        setTimeout(() => nav({ to: "/dashboard" }), 1400);
      } else {
        setStep((s) => s + 1);
        setPicked(null);
      }
    }, 800);
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-6">
      <div className="grid-bg absolute inset-0 opacity-20" />
      <Toaster />
      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Placement test</span>
          <span>{step + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            animate={{ width: `${((step + (done ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-[var(--neon)] to-[var(--cyan)]"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="glass rounded-2xl p-8"
          >
            <h2 className="text-2xl font-black">{q.q}</h2>
            <div className="mt-6 grid gap-3">
              {q.a.map((opt, i) => {
                const isCorrect = picked !== null && i === q.correct;
                const isWrongPick = picked === i && i !== q.correct;
                return (
                  <button
                    key={i}
                    disabled={picked !== null}
                    onClick={() => choose(i)}
                    className={`flex items-center justify-between rounded-xl border px-5 py-3 text-left text-sm font-medium transition-all ${
                      isCorrect
                        ? "border-[var(--neon)] bg-[var(--neon)]/10 text-[var(--neon)]"
                        : isWrongPick
                        ? "border-destructive bg-destructive/10 text-destructive animate-shake"
                        : "border-border bg-background/40 hover:border-[var(--neon)]/60"
                    }`}
                  >
                    {opt}
                    {isCorrect && <CheckCircle2 className="h-5 w-5" />}
                    {isWrongPick && <XCircle className="h-5 w-5" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
