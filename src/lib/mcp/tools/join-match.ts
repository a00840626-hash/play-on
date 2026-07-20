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
  name: "join_match",
  title: "Unirse a un partido",
  description: "Registra al usuario autenticado como participante de un partido de PlayOn por su id.",
  inputSchema: {
    match_id: z.string().uuid().describe("UUID del partido al que unirse"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ match_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("match_participants")
      .insert({ match_id, user_id: ctx.getUserId(), status: "confirmed" })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Te uniste al partido ${match_id}` }],
      structuredContent: { participant: data },
    };
  },
});
