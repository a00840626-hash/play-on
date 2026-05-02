import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.6 15.4 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.1z"/>
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-4.9l-6-5.1c-2 1.4-4.4 2.2-6.9 2.2-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6 5.1C40.9 35 43.5 30 43.5 24c0-1.2-.1-2.3-.3-3.5z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.365 1.43c0 1.14-.42 2.21-1.13 3.02-.77.88-2.02 1.56-3.05 1.48-.13-1.12.42-2.28 1.1-3.04.78-.86 2.13-1.51 3.08-1.46zM20.5 17.4c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.94-1-4.03-1-2.09.01-2.53 1.02-4.07 1-1.73-.02-3.05-1.77-4.04-3.33C.04 16.13-.21 11.07 1.96 8.4c1.54-1.9 3.97-3.01 6.25-3.01 2.32 0 3.78 1.27 5.7 1.27 1.86 0 3-1.27 5.68-1.27 2.03 0 4.18 1.11 5.71 3.02-5.02 2.75-4.21 9.93-.8 9z"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(
        "playon:onboarding",
        JSON.stringify({ email, login: true, completedAt: Date.now() })
      );
    } catch {}
    navigate("/");
  };

  const canSubmit = email.includes("@") && password.length >= 4;

  return (
    <div className="min-h-full w-full bg-background text-foreground flex flex-col px-6 pt-16 pb-8">
      {/* Logo */}
      <div className="flex items-center gap-2 animate-fade-up">
        <div className="h-9 w-9 rounded bg-primary flex items-center justify-center glow-green">
          <span className="font-display text-2xl text-primary-foreground leading-none">P</span>
        </div>
        <span className="font-display text-3xl leading-none">
          PLAY<span className="text-primary text-glow">ON</span>
        </span>
      </div>

      <h1 className="font-display text-4xl mt-10 leading-none">
        BIENVENIDO <span className="text-primary text-glow">DE VUELTA</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Inicia sesión para continuar jugando.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <button
          type="button"
          onClick={submit as never}
          className="w-full h-12 rounded bg-foreground text-background font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <GoogleIcon /> Entrar con Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">o</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <label className="block">
          <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">
            Email
          </span>
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
          <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">
            Contraseña
          </span>
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
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-primary font-mono uppercase tracking-widest"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed glow-green hover:brightness-110 transition"
        >
          Entrar <ArrowRight size={16} />
        </button>
      </form>

      <div className="mt-auto pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/onboarding" className="text-primary font-bold hover:text-glow">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
