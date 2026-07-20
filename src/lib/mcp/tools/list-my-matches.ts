import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_my_matches",
  title: "Mis partidos",
  description: "Lista los partidos en los que el usuario autenticado participa o es organizador.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const uid = ctx.getUserId();
    const { data: participating, error: e1 } = await supabase
      .from("match_participants")
      .select("status, joined_at, match:matches(id, sport, title, starts_at, location, status, max_players, price_per_player)")
      .eq("user_id", uid);
    if (e1) return { content: [{ type: "text", text: e1.message }], isError: true };
    const { data: hosting, error: e2 } = await supabase
      .from("matches")
      .select("id, sport, title, starts_at, location, status, max_players, price_per_player")
      .eq("host_id", uid);
    if (e2) return { content: [{ type: "text", text: e2.message }], isError: true };
    const payload = { hosting: hosting ?? [], participating: participating ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
