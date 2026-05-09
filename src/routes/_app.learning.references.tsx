import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_app/learning/references")({
  component: References,
});

function References() {
  const { data: refs } = useQuery({
    queryKey: ["refs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("references_list").select("*").order("order_index");
      if (error) throw error;
      return data;
    },
  });
  return (
    <ul className="space-y-3">
      {refs?.map((r) => (
        <li key={r.id} className="glass rounded-2xl p-4">
          <p className="text-sm leading-relaxed">{r.citation}</p>
          {r.url && (
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--neon)] hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Open link
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
