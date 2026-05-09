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
      const { data, error } = await supabase.from("videos").select("*").order("order_index");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      {videos?.map((v) => {
        const id = ytId(v.url);
        const thumb = v.thumbnail_url || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null);
        return (
          <a
            key={v.id}
            href={v.url}
            target="_blank"
            rel="noreferrer"
            className="glass block overflow-hidden rounded-2xl hover:border-[var(--neon)]/60"
          >
            <div className="relative aspect-video bg-black">
              {thumb ? (
                <img src={thumb} alt={v.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground">No preview</div>
              )}
              <div className="absolute inset-0 grid place-items-center bg-black/30">
                <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold">{v.title}</h3>
              <p className="text-xs text-muted-foreground">{v.channel}</p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
