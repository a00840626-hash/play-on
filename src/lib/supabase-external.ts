import { createClient } from "@supabase/supabase-js";

// Cliente Supabase adicional apuntando a un proyecto externo.
// NO confundir con el cliente principal en src/integrations/supabase/client.ts
// (ese está gestionado por Lovable Cloud y no debe editarse).

const EXTERNAL_SUPABASE_URL = "https://krahznczjgavdzicoxsc.supabase.co";
const EXTERNAL_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rE6Y5Ldh-zZ5Pdv8KwrfZQ_XMfjID9a";

export const supabaseExternal = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "sb-external-auth", // evita colisión con el cliente principal
    },
  }
);
