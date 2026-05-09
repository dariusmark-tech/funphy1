import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlayCircle } from "lucide-react";

export const Route = createFileRoute("/_app/learning/videos")({
  component: VideosPage,
});

function ytId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  return m?.[1];
}

function VideosPage() {
  const { data: videos } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*, modules(title, order_index)")
        .order("order_index");
      if (error) throw error;
      return data as any[];
    },
  });

  // Group by module then by section title
  const groups: Record<string, Record<string, any[]>> = {};
  videos?.forEach((v) => {
    const m = v.modules?.title || "Other";
    const s = v.title;
    groups[m] ??= {};
    groups[m][s] ??= [];
    groups[m][s].push(v);
  });

  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([realm, sections]) => (
        <section key={realm}>
          <h2 className="mb-2 text-sm font-black italic text-primary">{realm}</h2>
          <div className="space-y-3">
            {Object.entries(sections).map(([sec, list]) => (
              <div key={sec}>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {sec}
                </p>
                <div className="grid gap-2">
                  {list.map((v) => {
                    const id = ytId(v.url);
                    const thumb = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
                    return (
                      <a
                        key={v.id}
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card hover:border-primary/60"
                      >
                        <div className="relative aspect-video w-28 shrink-0 bg-black">
                          {thumb && (
                            <img src={thumb} alt={sec} className="h-full w-full object-cover" />
                          )}
                          <div className="absolute inset-0 grid place-items-center bg-black/30 group-hover:bg-black/10">
                            <PlayCircle className="h-6 w-6 text-white drop-shadow" />
                          </div>
                        </div>
                        <div className="flex-1 py-2 pr-2">
                          <p className="text-xs font-bold leading-tight">{sec}</p>
                          <p className="truncate text-[10px] text-muted-foreground">YouTube</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
