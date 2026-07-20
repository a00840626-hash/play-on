import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Wrapper tipado para la API beta supabase.auth.oauth.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Falta authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("El servidor de autorización no devolvió una URL de redirección.");
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-full flex items-center justify-center p-6 bg-background text-foreground">
        <div className="max-w-sm w-full space-y-3 text-center">
          <h1 className="font-display text-2xl">No se pudo cargar la autorización</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link to="/" className="text-primary underline text-sm">Volver al inicio</Link>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-full flex items-center justify-center bg-background text-foreground">
        <Loader2 className="animate-spin text-primary" />
      </main>
    );
  }

  const clientName = details.client?.name ?? details.client?.client_name ?? "Una aplicación";
  const redirectUri = details.client?.redirect_uris?.[0] ?? details.redirect_uri;

  return (
    <main className="min-h-full flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-sm w-full bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded bg-primary flex items-center justify-center glow-green">
            <Shield size={18} className="text-primary-foreground" />
          </div>
          <span className="font-display text-xl">
            PLAY<span className="text-primary">ON</span>
          </span>
        </div>

        <div>
          <h1 className="font-display text-2xl leading-tight">
            Conectar <span className="text-primary">{clientName}</span> a tu cuenta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esto permite que {clientName} use PlayOn como tú. Aplican las políticas y RLS de la app; no se
            evitan permisos.
          </p>
        </div>

        <ul className="text-xs font-mono text-muted-foreground space-y-1">
          <li>• Leer tu perfil PlayOn</li>
          <li>• Ver canchas y partidos abiertos</li>
          <li>• Unirte a partidos en tu nombre</li>
          {redirectUri && <li className="truncate">↳ redirect: {redirectUri}</li>}
        </ul>

        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 h-11 rounded border border-border bg-card text-sm font-bold uppercase tracking-widest font-mono text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 h-11 rounded bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest font-mono glow-green disabled:opacity-50"
          >
            {busy ? "…" : "Aprobar"}
          </button>
        </div>
      </div>
    </main>
  );
}
