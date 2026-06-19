import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // When user arrives via recovery link, Supabase fires PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also allow if user already has a session (link processed)
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) { toast({ title: "Contraseña muy corta", description: "Mínimo 6 caracteres", variant: "destructive" }); return; }
    if (pwd !== pwd2) { toast({ title: "No coinciden", description: "Las contraseñas no son iguales", variant: "destructive" }); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Contraseña actualizada", description: "Ya puedes entrar con tu nueva contraseña" });
    navigate("/");
  };

  return (
    <div className="min-h-full w-full bg-background text-foreground flex flex-col px-6 pt-12 pb-8">
      <h1 className="font-display text-4xl leading-none">
        NUEVA<br /><span className="text-primary text-glow">CONTRASEÑA</span>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Crea una nueva contraseña para tu cuenta.</p>

      {!ready ? (
        <div className="mt-10 text-center text-sm text-muted-foreground">
          <Loader2 className="animate-spin text-primary mx-auto" /> Validando link...
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          {[
            { v: pwd, set: setPwd, label: "Nueva contraseña" },
            { v: pwd2, set: setPwd2, label: "Confirmar" },
          ].map((f, i) => (
            <label key={i} className="block">
              <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">{f.label}</span>
              <div className="relative mt-1.5">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={f.v}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-9 pr-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm"
                  required
                  minLength={6}
                />
              </div>
            </label>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 glow-green hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Guardar contraseña"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
