import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("playon:onboarding", JSON.stringify({ email, completedAt: Date.now() }));
    } catch {}
    navigate("/");
  };

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
        BIENVENIDO <span className="text-primary text-glow">DE VUELTA</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Modo demo: entra con cualquier correo.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
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

        <button
          type="submit"
          className="w-full h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 glow-green hover:brightness-110 transition"
        >
          Entrar <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
};

export default Login;
