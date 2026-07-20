import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCourts from "./tools/list-courts";
import listOpenMatches from "./tools/list-open-matches";
import getMyProfile from "./tools/get-my-profile";
import listMyMatches from "./tools/list-my-matches";
import joinMatch from "./tools/join-match";

// El project ref es literal en build (Vite lo inline), así que el módulo se
// mantiene import-safe: sin lecturas de env en top-level ni throws.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "playon-mcp",
  title: "PlayOn MCP",
  version: "0.1.0",
  instructions:
    "Herramientas para PlayOn, la comunidad deportiva de Monterrey. " +
    "Usa `list_courts` para descubrir canchas, `list_open_matches` para ver partidos abiertos, " +
    "`get_my_profile` y `list_my_matches` para el perfil y partidos del usuario, " +
    "y `join_match` para unirse a un partido por id.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCourts, listOpenMatches, getMyProfile, listMyMatches, joinMatch],
});
