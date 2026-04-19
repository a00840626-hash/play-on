import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { sportLabels, Sport, SkillLevel, courts } from "@/data/mock";
import { toast } from "sonner";

const skills: { id: SkillLevel; label: string }[] = [
  { id: "principiante", label: "Principiante" },
  { id: "intermedio", label: "Intermedio" },
  { id: "avanzado", label: "Avanzado" },
];

const NewMatch = () => {
  const navigate = useNavigate();
  const [sport, setSport] = useState<Sport>("futbol");
  const [courtId, setCourtId] = useState<string>(courts[0].id);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("18:00");
  const [players, setPlayers] = useState(7);
  const [skill, setSkill] = useState<SkillLevel>("intermedio");
  const [price, setPrice] = useState(100);
  const [isPublic, setIsPublic] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("¡Partido creado!", { description: "Comparte el link para invitar jugadores." });
    navigate("/matches");
  };

  return (
    <AppShell subtitle="Nuevo partido">
      <div className="px-4 pt-3 flex items-center gap-3">
        <Link to="/matches" className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Crear partido</p>
          <h1 className="font-display text-3xl leading-none">JUEGA AHORA</h1>
        </div>
      </div>

      <form onSubmit={submit} className="px-4 mt-6 space-y-5 pb-8">
        <Field label="Deporte">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(sportLabels) as Sport[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSport(s)}
                className={`h-11 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono transition-all ${
                  sport === s
                    ? "bg-primary text-primary-foreground border-primary glow-green"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {sportLabels[s]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Cancha">
          <select
            value={courtId}
            onChange={(e) => setCourtId(e.target.value)}
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm"
          >
            {courts.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.neighborhood}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm font-mono"
            />
          </Field>
          <Field label="Hora">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm font-mono"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Jugadores">
            <input
              type="number"
              min={2}
              max={22}
              value={players}
              onChange={(e) => setPlayers(Number(e.target.value))}
              className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm font-mono"
            />
          </Field>
          <Field label="Precio / jugador">
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm font-mono"
            />
          </Field>
        </div>

        <Field label="Nivel">
          <div className="grid grid-cols-3 gap-2">
            {skills.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSkill(s.id)}
                className={`h-11 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono transition-all ${
                  skill === s.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Visibilidad">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`h-11 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono ${
                isPublic ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
              }`}
            >
              Público
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`h-11 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono ${
                !isPublic ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
              }`}
            >
              Privado
            </button>
          </div>
        </Field>

        <button
          type="submit"
          className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm glow-green hover:glow-green-strong transition-all active:scale-[0.98]"
        >
          Publicar partido
        </button>
      </form>
    </AppShell>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

export default NewMatch;
