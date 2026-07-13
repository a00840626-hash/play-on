import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const MUNICIPIOS = [
  "Monterrey", "Guadalupe", "Apodaca", "Escobedo", "San Nicolás",
  "Santa Catarina", "García", "Juárez", "San Pedro", "Cadereyta",
  "Salinas Victoria", "Santiago",
];

const SPORTS: { id: string; label: string }[] = [
  { id: "futbol", label: "Fútbol" },
  { id: "padel", label: "Pádel" },
  { id: "tenis", label: "Tenis" },
  { id: "basquetbol", label: "Básquet" },
  { id: "voleibol", label: "Voleibol" },
  { id: "running", label: "Running" },
];

const LEVELS = [
  { id: "principiante", label: "Principiante" },
  { id: "intermedio", label: "Intermedio" },
  { id: "avanzado", label: "Avanzado" },
] as const;

const DAYS = [
  { id: "lun", label: "Lun" },
  { id: "mar", label: "Mar" },
  { id: "mie", label: "Mié" },
  { id: "jue", label: "Jue" },
  { id: "vie", label: "Vie" },
  { id: "sab", label: "Sáb" },
  { id: "dom", label: "Dom" },
];

const schema = z.object({
  display_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(50),
  municipio: z.string().min(1, "Elige tu municipio"),
  sports: z.array(z.string()).min(1, "Elige al menos un deporte"),
  skill_level: z.enum(["principiante", "intermedio", "avanzado"]),
  availability: z.array(z.string()).min(1, "Elige al menos un día"),
  avatar_url: z.string().optional().or(z.literal("")),
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    municipio: "",
    sports: [] as string[],
    skill_level: "" as "" | "principiante" | "intermedio" | "avanzado",
    availability: [] as string[],
    avatar_url: "",
  });

  // Redirect to login if not authed; load existing profile
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    supabase
      .from("profiles")
      .select("display_name, municipio, sports, skill_level, availability, avatar_url, onboarded")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.onboarded) {
          navigate("/", { replace: true });
          return;
        }
        if (data) {
          setForm({
            display_name: data.display_name === "Jugador" ? "" : (data.display_name ?? ""),
            municipio: data.municipio ?? "",
            sports: data.sports ?? [],
            skill_level: (data.skill_level as any) ?? "",
            availability: data.availability ?? [],
            avatar_url: data.avatar_url ?? "",
          });
        }
      });
  }, [user, authLoading, navigate]);

  const toggle = (key: "sports" | "availability", val: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      toast({ title: "Imagen muy grande", description: "Máx 2 MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatar_url: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Faltan datos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: form.display_name.trim(),
      municipio: form.municipio,
      sports: form.sports,
      skill_level: form.skill_level || null,
      availability: form.availability,
      avatar_url: form.avatar_url || null,
      onboarded: true,
      online: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "¡Perfil listo!", description: "Bienvenido a PlayOn." });
    navigate("/", { replace: true });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const totalSteps = 4;
  const canNext =
    (step === 0 && form.display_name.trim().length >= 2) ||
    (step === 1 && form.municipio) ||
    (step === 2 && form.sports.length > 0 && form.skill_level) ||
    (step === 3 && form.availability.length > 0);

  return (
    <div className="min-h-full w-full bg-background text-foreground flex flex-col px-6 pt-10 pb-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary glow-green" : "bg-border"}`}
          />
        ))}
      </div>

      <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">
        Paso {step + 1} de {totalSteps}
      </p>

      {step === 0 && (
        <>
          <h1 className="font-display text-4xl mt-2 leading-none">¿CÓMO TE <span className="text-primary text-glow">LLAMAS?</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Así te verán otros jugadores.</p>
          <label className="block mt-6">
            <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">Nombre</span>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="Carlos V."
              className="mt-1.5 w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              maxLength={50}
            />
          </label>

          <label className="block mt-5">
            <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">Foto (opcional)</span>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-card border border-border overflow-hidden flex items-center justify-center">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-2xl text-muted-foreground">
                    {form.display_name.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={onFile}
                className="text-xs file:mr-3 file:px-3 file:py-2 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:font-bold file:uppercase file:tracking-widest file:text-[10px]"
              />
            </div>
          </label>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="font-display text-4xl mt-2 leading-none">¿DE QUÉ <span className="text-primary text-glow">MUNICIPIO?</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Te conectamos con jugadores cerca.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
            {MUNICIPIOS.map((m) => {
              const active = form.municipio === m;
              return (
                <button
                  key={m}
                  onClick={() => setForm({ ...form, municipio: m })}
                  className={`h-11 rounded border text-xs font-mono uppercase tracking-widest transition ${
                    active ? "border-primary bg-primary/10 text-primary glow-green" : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="font-display text-4xl mt-2 leading-none">TUS <span className="text-primary text-glow">DEPORTES</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Elige todos los que practiques.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {SPORTS.map((s) => {
              const active = form.sports.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle("sports", s.id)}
                  className={`h-10 px-4 rounded-full border text-xs font-mono uppercase tracking-widest transition ${
                    active ? "border-primary bg-primary text-primary-foreground glow-green" : "border-border bg-card text-foreground"
                  }`}
                >
                  {active && <Check size={12} className="inline -mt-0.5 mr-1" />}
                  {s.label}
                </button>
              );
            })}
          </div>

          <p className="mt-7 text-[11px] uppercase tracking-widest font-mono text-muted-foreground">Tu nivel</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {LEVELS.map((l) => {
              const active = form.skill_level === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setForm({ ...form, skill_level: l.id })}
                  className={`h-11 rounded border text-[11px] font-mono uppercase tracking-widest transition ${
                    active ? "border-primary bg-primary/10 text-primary glow-green" : "border-border bg-card text-foreground"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="font-display text-4xl mt-2 leading-none">¿CUÁNDO <span className="text-primary text-glow">JUEGAS?</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Tus días disponibles para partidos.</p>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {DAYS.map((d) => {
              const active = form.availability.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggle("availability", d.id)}
                  className={`h-14 rounded border text-sm font-mono uppercase tracking-widest transition ${
                    active ? "border-primary bg-primary text-primary-foreground glow-green" : "border-border bg-card text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-auto pt-8 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="h-12 px-5 rounded bg-card border border-border text-foreground font-bold uppercase tracking-widest text-xs"
          >
            Atrás
          </button>
        )}
        {step < totalSteps - 1 ? (
          <button
            onClick={() => canNext && setStep(step + 1)}
            disabled={!canNext}
            className="flex-1 h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 glow-green disabled:opacity-40"
          >
            Continuar <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={save}
            disabled={!canNext || saving}
            className="flex-1 h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 glow-green disabled:opacity-40"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : (<>Finalizar <Check size={16} /></>)}
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
