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
  name: "list_courts",
  title: "Listar canchas",
  description: "Lista canchas activas en PlayOn. Filtra opcionalmente por deporte y/o municipio de Monterrey.",
  inputSchema: {
    sport: z.string().optional().describe("Deporte (ej. futbol, tenis, padel)"),
    municipio: z.string().optional().describe("Municipio de la Zona Metropolitana de Monterrey"),
    limit: z.number().int().min(1).max(50).optional().describe("Máximo de resultados (por defecto 20)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ sport, municipio, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("courts")
      .select("id, name, sport, municipio, address, price_per_hour, image_url, description")
      .eq("is_active", true)
      .limit(limit ?? 20);
    if (sport) query = query.eq("sport", sport);
    if (municipio) query = query.ilike("municipio", `%${municipio}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { courts: data ?? [] },
    };
  },
});
