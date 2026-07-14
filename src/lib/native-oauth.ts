// Flujo OAuth para el build nativo (Capacitor).
// Google bloquea OAuth dentro de WKWebView, así que en nativo abrimos el broker
// de Lovable en el navegador del sistema (SFSafariViewController / Custom Tab)
// y regresamos a la app vía el deep link playon://oauth-callback, igual que el
// flujo lovable:// que usa la propia app de Lovable.

import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/integrations/supabase/client";

const CALLBACK_SCHEME = "playon";
const CALLBACK_URL = `${CALLBACK_SCHEME}://oauth-callback`;
const OAUTH_TIMEOUT_MS = 5 * 60 * 1000;

export const isNativePlatform = () => Capacitor.isNativePlatform();

const generateState = () =>
  [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");

function parseCallback(url: string): Record<string, string> {
  const raw = url.split(/[#?]/)[1] ?? "";
  return Object.fromEntries(new URLSearchParams(raw));
}

export async function signInWithGoogleNative(): Promise<{ error: Error | null }> {
  const state = generateState();
  const params = new URLSearchParams({
    provider: "google",
    redirect_uri: CALLBACK_URL,
    state,
  });
  const url = `${window.location.origin}/~oauth/initiate?${params.toString()}`;

  return new Promise((resolve) => {
    let settled = false;
    let listenerHandle: { remove: () => void } | null = null;

    const finish = async (error: Error | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      listenerHandle?.remove();
      await Browser.close().catch(() => {});
      resolve({ error });
    };

    const timeoutId = setTimeout(
      () => finish(new Error("El inicio de sesión tardó demasiado. Intenta de nuevo.")),
      OAUTH_TIMEOUT_MS,
    );

    App.addListener("appUrlOpen", async ({ url: openedUrl }) => {
      if (!openedUrl.startsWith(CALLBACK_URL)) return;
      const data = parseCallback(openedUrl);
      if (data.state !== state) {
        return finish(new Error("Respuesta de autenticación inválida."));
      }
      if (data.error) {
        return finish(new Error(data.error_description ?? "No se pudo iniciar sesión."));
      }
      if (!data.access_token || !data.refresh_token) {
        return finish(new Error("No se recibieron credenciales."));
      }
      const { error } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      finish(error ?? null);
    }).then((handle) => {
      listenerHandle = handle;
      return Browser.open({ url, presentationStyle: "popover" });
    }).catch((e) => finish(e instanceof Error ? e : new Error(String(e))));
  });
}
