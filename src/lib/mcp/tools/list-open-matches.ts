import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_open_matches",
  title: "Listar partidos abiertos",
  description: "Lista los próximos partidos abiertos en PlayOn con cupos disponibles.",
  inputSchema: {
    sport: z.string().optional().describe("Filtra por deporte"),
    skill_level: z.string().optional().describe("Nivel: beginner, intermediate, advanced"),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ sport, skill_level, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("matches")
      .select("id, sport, title, location, starts_at, duration_minutes, max_players, skill_level, price_per_player, status, notes")
      .gte("starts_at", new Date().toISOString())
      .in("status", ["open", "scheduled"])
      .order("starts_at", { ascending: true })
      .limit(limit ?? 20);
    if (sport) query = query.eq("sport", sport);
    if (skill_level) query = query.eq("skill_level", skill_level);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { matches: data ?? [] },
    };
  },
});
