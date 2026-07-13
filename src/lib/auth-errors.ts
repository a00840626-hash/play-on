// Traduce errores de Supabase Auth a mensajes claros en español.

interface AuthErrorLike {
  code?: string;
  message?: string;
  status?: number;
}

const BY_CODE: Record<string, string> = {
  invalid_credentials: "Email o contraseña incorrectos.",
  email_not_confirmed: "Tu correo aún no está confirmado. Revisa tu bandeja de entrada.",
  user_already_exists: "Ya existe una cuenta con este correo. Intenta entrar.",
  email_exists: "Ya existe una cuenta con este correo. Intenta entrar.",
  weak_password: "La contraseña es muy débil. Usa al menos 6 caracteres.",
  over_email_send_rate_limit: "Enviamos demasiados correos en poco tiempo. Espera unos minutos e intenta de nuevo.",
  over_request_rate_limit: "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
  same_password: "La nueva contraseña debe ser diferente a la actual.",
  session_expired: "Tu sesión expiró. Vuelve a iniciar sesión.",
  otp_expired: "El link expiró. Solicita uno nuevo.",
  user_not_found: "No encontramos una cuenta con este correo.",
  signup_disabled: "El registro está deshabilitado por el momento.",
};

const BY_MESSAGE: [RegExp, string][] = [
  [/invalid login credentials/i, "Email o contraseña incorrectos."],
  [/email not confirmed/i, "Tu correo aún no está confirmado. Revisa tu bandeja de entrada."],
  [/already registered/i, "Ya existe una cuenta con este correo. Intenta entrar."],
  [/password should be at least/i, "La contraseña es muy débil. Usa al menos 6 caracteres."],
  [/rate limit/i, "Demasiados intentos. Espera unos minutos e intenta de nuevo."],
  [/expired/i, "El link expiró. Solicita uno nuevo."],
  [/network|fetch/i, "Problema de conexión. Revisa tu internet e intenta de nuevo."],
];

export function authErrorMessage(err: unknown): string {
  const e = (err ?? {}) as AuthErrorLike;
  if (e.code && BY_CODE[e.code]) return BY_CODE[e.code];
  const msg = e.message ?? "";
  for (const [re, text] of BY_MESSAGE) {
    if (re.test(msg)) return text;
  }
  return msg || "Algo salió mal. Intenta de nuevo.";
}

export const isEmailNotConfirmed = (err: unknown): boolean => {
  const e = (err ?? {}) as AuthErrorLike;
  return e.code === "email_not_confirmed" || /email not confirmed/i.test(e.message ?? "");
};
