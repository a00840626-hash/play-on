import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "@/hooks/use-toast";
import { authErrorMessage, isEmailNotConfirmed } from "@/lib/auth-errors";

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128),
});

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    setNeedsConfirmation(false);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/onboarding` },
        });
        if (error) throw error;
        toast({
          title: "Revisa tu correo",
          description: "Te enviamos un link de confirmación para activar tu cuenta.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      if (isEmailNotConfirmed(err)) setNeedsConfirmation(true);
      toast({
        title: mode === "signup" ? "No se pudo crear la cuenta" : "No se pudo iniciar sesión",
        description: authErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setResending(false);
    if (error) {
      toast({ title: "No se pudo reenviar", description: authErrorMessage(error), variant: "destructive" });
      return;
    }
    toast({ title: "Correo reenviado", description: `Revisa la bandeja de ${email}.` });
  };

  const googleSignIn = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      toast({ title: "No se pudo entrar con Google", description: authErrorMessage(res.error), variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-background text-foreground flex flex-col px-6 pt-12 pb-8">
      <div className="flex items-center gap-2 animate-fade-up">
        <div className="h-9 w-9 rounded bg-primary flex items-center justify-center glow-green">
          <span className="font-display text-2xl text-primary-foreground leading-none">P</span>
        </div>
        <span className="font-display text-3xl leading-none">
          PLAY<span className="text-primary text-glow">ON</span>
        </span>
      </div>

      <h1 className="font-display text-4xl mt-10 leading-none">
        HAZ AMIGOS.<br />
        JUEGA <span className="text-primary text-glow">MONTERREY</span>.
      </h1>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        Practica tu deporte favorito y pertenece a la comunidad deportiva más grande de Monterrey.
      </p>

      {/* Mode tabs */}
      <div className="mt-6 flex gap-1 p-1 rounded-full border border-border bg-card">
        {(["signin", "signup"] as const).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 h-9 rounded-full text-[11px] font-bold uppercase tracking-widest font-mono transition-all ${
                active ? "bg-primary text-primary-foreground glow-green" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Entrar" : "Crear cuenta"}
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">Email</span>
          <div className="relative mt-1.5">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              className="w-full h-12 pl-9 pr-3 rounded bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              required
            />
          </div>
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">Contraseña</span>
          <div className="relative mt-1.5">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full h-12 pl-9 pr-3 rounded bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              required
              minLength={6}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 glow-green hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : (
            <>{mode === "signup" ? "Crear cuenta" : "Entrar"} <ArrowRight size={16} /></>
          )}
        </button>

        {needsConfirmation && (
          <button
            type="button"
            onClick={resendConfirmation}
            disabled={resending}
            className="w-full h-10 rounded border border-primary/50 bg-primary/10 text-primary text-[11px] font-mono uppercase tracking-widest hover:bg-primary/20 transition disabled:opacity-50"
          >
            {resending ? "Reenviando..." : "Reenviar correo de confirmación"}
          </button>
        )}

        {mode === "signin" && (
          <div className="text-right">
            <Link to="/forgot-password" className="text-[11px] font-mono text-muted-foreground hover:text-primary underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">o</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        type="button"
        onClick={googleSignIn}
        disabled={loading}
        className="w-full h-12 rounded bg-card border border-border text-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:border-primary transition disabled:opacity-50"
      >
        <GoogleIcon /> Continuar con Google
      </button>

      <p className="mt-6 text-center text-[11px] font-mono text-muted-foreground">
        Al continuar aceptas los{" "}
        <Link to="/terms" className="text-primary underline">Términos</Link> y la{" "}
        <Link to="/privacy" className="text-primary underline">Política de privacidad</Link>.
      </p>
      <Link to="/" className="mt-3 text-center text-[11px] font-mono text-muted-foreground underline">
        Volver al inicio
      </Link>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.7 6.3 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.7 6.3 29.1 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5l-6-5.1c-2 1.4-4.5 2.1-7.1 2.1-5.4 0-9.9-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.6 1.7-1.7 3.2-3.1 4.3l6 5.1c-.4.4 6.3-4.6 6.3-13.4 0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);

export default Login;
