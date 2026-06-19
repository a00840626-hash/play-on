import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Loader2, Send } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const schema = z.object({ email: z.string().trim().email("Email inválido").max(255) });

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast({ title: "Email inválido", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast({ title: "Revisa tu correo", description: "Te enviamos un link para reestablecer tu contraseña." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message ?? "No se pudo enviar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-background text-foreground flex flex-col px-6 pt-12 pb-8">
      <Link to="/login" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-muted-foreground">
        <ArrowLeft size={14} /> Volver
      </Link>
      <h1 className="font-display text-4xl mt-8 leading-none">
        OLVIDÉ MI<br /><span className="text-primary text-glow">CONTRASEÑA</span>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Ingresa tu email y te enviaremos un link para reestablecer tu contraseña.
      </p>

      {sent ? (
        <div className="mt-8 p-5 rounded border border-primary/40 bg-card text-center">
          <Send size={32} className="text-primary mx-auto" />
          <p className="mt-3 text-sm">Revisa tu correo <strong>{email}</strong> y sigue el link.</p>
          <Link to="/login" className="mt-4 inline-block text-xs uppercase tracking-widest font-mono text-primary">
            Volver al login →
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
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
                className="w-full h-12 pl-9 pr-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm"
                required
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 glow-green hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Enviar link"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
