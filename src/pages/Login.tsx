import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast({ title: "Cuenta creada", description: "Revisa tu correo si se requiere confirmación." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      try { localStorage.setItem("playon:onboarding", JSON.stringify({ email, completedAt: Date.now() })); } catch {}
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = email.includes("@") && password.length >= 6 && (mode === "signin" || name.length > 0);

  return (
    <div className="min-h-full w-full bg-background text-foreground flex flex-col px-6 pt-16 pb-8">
      <div className="flex items-center gap-2 animate-fade-up">
        <div className="h-9 w-9 rounded bg-primary flex items-center justify-center glow-green">
          <span className="font-display text-2xl text-primary-foreground leading-none">P</span>
        </div>
        <span className="font-display text-3xl leading-none">
          PLAY<span className="text-primary text-glow">ON</span>
        </span>
      </div>

      <h1 className="font-display text-4xl mt-10 leading-none">
        {mode === "signin" ? <>BIENVENIDO <span className="text-primary text-glow">DE VUELTA</span></> : <>CREA TU <span className="text-primary text-glow">CUENTA</span></>}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signin" ? "Inicia sesión para conectar con tu comunidad." : "Únete a PlayOn y empieza a jugar."}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === "signup" && (
          <label className="block">
            <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Ruiz"
              className="w-full h-12 px-3 mt-1.5 rounded bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </label>
        )}
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">Email</span>
          <div className="relative mt-1.5">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
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
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 pl-9 pr-10 rounded bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              required
            />
            <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={!canSubmit || busy}
          className="w-full h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed glow-green hover:brightness-110 transition"
        >
          {busy ? "..." : (mode === "signin" ? "Entrar" : "Crear cuenta")} <ArrowRight size={16} />
        </button>
      </form>

      <div className="mt-auto pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          {mode === "signin" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-bold hover:text-glow">
            {mode === "signin" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
