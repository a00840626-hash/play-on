import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const SPORTS = [
  { id: "futbol", label: "Fútbol" }, { id: "tenis", label: "Tenis" }, { id: "padel", label: "Pádel" },
  { id: "basquetbol", label: "Básquet" }, { id: "pickleball", label: "Pickleball" }, { id: "voleibol", label: "Voleibol" },
];
const LEVELS = [
  { id: "principiante", label: "Principiante" }, { id: "intermedio", label: "Intermedio" }, { id: "avanzado", label: "Avanzado" },
];

interface Court { id: string; name: string; sport: string; municipio: string | null }

const NewMatch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courts, setCourts] = useState<Court[]>([]);
  const [sport, setSport] = useState("futbol");
  const [title, setTitle] = useState("");
  const [courtId, setCourtId] = useState<string>("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState(60);
  const [players, setPlayers] = useState(8);
  const [skill, setSkill] = useState("intermedio");
  const [price, setPrice] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("courts").select("id, name, sport, municipio").eq("is_active", true).then(({ data }) => {
      setCourts((data as Court[]) ?? []);
    });
  }, []);

  const filteredCourts = courts.filter((c) => c.sport === sport);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) { toast({ title: "Ponle título a tu partido", variant: "destructive" }); return; }
    if (!date) { toast({ title: "Elige fecha", variant: "destructive" }); return; }

    const starts_at = new Date(`${date}T${time}`).toISOString();
    setSaving(true);
    const { data, error } = await supabase.from("matches").insert({
      host_id: user.id, sport, title: title.trim(),
      court_id: courtId || null,
      location: location.trim() || null,
      starts_at, duration_minutes: duration, max_players: players,
      skill_level: skill, price_per_player: price, notes: notes.trim() || null,
    }).select("id").single();
    if (error) { setSaving(false); toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    // Host auto-joins
    await supabase.from("match_participants").insert({ match_id: data.id, user_id: user.id });
    setSaving(false);
    toast({ title: "+40 XP — Partido creado", description: "Tu partido ya aparece para otros jugadores." });
    navigate(`/matches/${data.id}`);
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
            {SPORTS.map((s) => (
              <button key={s.id} type="button" onClick={() => { setSport(s.id); setCourtId(""); }}
                className={`h-11 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono ${sport === s.id ? "bg-primary text-primary-foreground border-primary glow-green" : "bg-card border-border text-muted-foreground"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Título">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
            placeholder="Cascarita los miércoles"
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm" required />
        </Field>

        <Field label="Cancha (opcional)">
          <select value={courtId} onChange={(e) => setCourtId(e.target.value)}
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm">
            <option value="">— Sin cancha asignada —</option>
            {filteredCourts.map((c) => <option key={c.id} value={c.id}>{c.name}{c.municipio ? ` — ${c.municipio}` : ""}</option>)}
          </select>
        </Field>

        <Field label="Lugar / referencias">
          <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120}
            placeholder="Parque Cumbres, cancha 2"
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm font-mono" /></Field>
          <Field label="Hora"><input type="time" value={time} onChange={(e) => setTime(e.target.value)} required
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm font-mono" /></Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Duración (min)"><input type="number" min={15} max={300} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm font-mono" /></Field>
          <Field label="Max jugadores"><input type="number" min={2} max={30} value={players} onChange={(e) => setPlayers(Number(e.target.value))}
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm font-mono" /></Field>
          <Field label="$ / jugador"><input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm font-mono" /></Field>
        </div>

        <Field label="Nivel">
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((s) => (
              <button key={s.id} type="button" onClick={() => setSkill(s.id)}
                className={`h-11 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono ${skill === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Notas (opcional)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={400}
            placeholder="Llevamos balón / nivel competitivo / etc."
            className="w-full px-3 py-2 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm resize-none" />
        </Field>

        <button type="submit" disabled={saving}
          className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm glow-green hover:brightness-110 disabled:opacity-50 flex items-center justify-center">
          {saving ? <Loader2 size={16} className="animate-spin" /> : "Publicar partido"}
        </button>
      </form>
    </AppShell>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1.5">{label}</span>
    {children}
  </label>
);

export default NewMatch;
