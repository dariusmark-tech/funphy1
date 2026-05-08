## PhysiClimb — Build Plan

PhysiClimb is a large app (LMS + 5 physics mini-games + gamification + admin CMS). I'll build it in focused phases so each ships working and looks great, instead of half-implementing everything at once.

### Phase 1 (this turn) — Foundation + Student Shell
- Enable Lovable Cloud (Auth + Postgres + RLS)
- Dark, neon-green design system in `src/styles.css` (physics-themed: vector arrows, trajectory accents, glow shadows, Framer Motion transitions)
- Schema: `profiles`, `user_roles` (separate table, `has_role()` security definer), `modules`, `lessons`, `quizzes`, `questions`, `user_progress`, `game_scores`, `daily_quests`, `transactions`
- Seed Modules 1–5 (Kinematics → Rotational) + a few sample lessons/questions
- Auth: email + Google, with placement test on first login
- Student routes: `/` landing, `/login`, `/dashboard` (streak, hearts, XP, physics score, module tree, daily quest, league badge, shop button), `/modules/:id`, `/practice`, `/shop`, `/profile`
- Hearts/XP/streak/gems logic with realtime sync

### Phase 2 (next turn) — Mini-Games
- One route per game: Vector Racer, Force Builder, Kinematics Jump, Energy Tycoon, Momentum Crash
- 3 difficulty levels each, immediate feedback, XP/heart hooks, progress saved to `game_scores`

### Phase 3 — Quiz Engine + Tools
- Checkpoint + module quizzes (MC, numeric, LaTeX formula via KaTeX)
- Formula Builder, Graphing Simulator, Mistake History
- Leaderboards (weekly league, 30-user buckets)
- Certificate PDF generation

### Phase 4 — Admin
- `/admin/*` guarded by `has_role(uid,'admin')`
- Users table, CMS (module/lesson/question builder), Analytics, Gamification controls, Settings, Exam Mode, CSV export

### Technical notes
- Stack stays TanStack Start + React 19 + Tailwind v4 + Lovable Cloud (your spec mentioned Vite/React + Supabase — Lovable Cloud IS Supabase under the hood; same Postgres/Auth/Realtime, no separate account needed).
- Roles in dedicated `user_roles` table with `has_role()` SECURITY DEFINER function (never on profile — privilege-escalation safe).
- KaTeX for LaTeX rendering, Framer Motion for animations, Recharts for analytics.
- Sound effects deferred until Phase 2 (need user gesture anyway).

### What I need from you before starting
Two quick decisions so Phase 1 lands right:
