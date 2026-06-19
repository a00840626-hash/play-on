import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Clock, Loader2, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Participant { user_id: string; profiles: { display_name: string | null } | null }
interface MatchRow {
  id: string; host_id: string; sport: string; title: string; starts_at: string;
  duration_minutes: number; location: string | null; max_players: number; skill_level: string | null;
  price_per_player: number; notes: string | null; court_id: string | null;
  host_profile: { display_name: string | null } | null;
  court: { name: string; address: string } | null;
}

const MatchDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    if (!id) return;
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from("matches").select("*, host_profile:profiles!matches_host_id_fkey(display_name), court:courts(name, address)").eq("id", id).maybeSingle(),
      supabase.from("match_participants").select("user_id, profiles(display_name)").eq("match_id", id),
    ]);
    setMatch(m as any);
    setParticipants((p as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <AppShell><div className="p-10 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div></AppShell>;
  if (!match) return <AppShell><div className="p-8 text-center text-muted-foreground">Partido no encontrado. <Link to="/matches" className="text-primary">Volver</Link></div></AppShell>;

  const d = new Date(match.starts_at);
  const dateStr = d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const timeStr = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const isHost = user?.id === match.host_id;
  const joined = participants.some((p) => p.user_id === user?.id);
  const spotsLeft = match.max_players - participants.length;

  const join = async () => {
    if (!user) return;
    setActing(true);
    const { error } = await supabase.from("match_participants").insert({ match_id: match.id, user_id: user.id });
    setActing(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "¡Te uniste al partido!" });
    load();
  };
  const leave = async () => {
    if (!user) return;
    setActing(true);
    await supabase.from("match_participants").delete().eq("match_id", match.id).eq("user_id", user.id);
    setActing(false);
    toast({ title: "Saliste del partido" });
    load();
  };
  const cancel = async () => {
    if (!confirm("¿Cancelar este partido? Esto borra las inscripciones.")) return;
    setActing(true);
    await supabase.from("matches").delete().eq("id", match.id);
    setActing(false);
    toast({ title: "Partido cancelado" });
    navigate("/matches");
  };

  return (
    <AppShell subtitle="Partido">
      <div className="px-4 pt-3 flex items-center justify-between">
        <Link to="/matches" className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft size={18} />
        </Link>
        {isHost && (
          <button onClick={cancel} className="h-10 px-3 rounded bg-card border border-destructive/40 text-destructive text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Trash2 size={14} /> Cancelar
          </button>
        )}
      </div>

      <section className="px-4 mt-4">
        <p className="text-xs uppercase tracking-widest font-mono text-primary">{match.sport}</p>
        <h1 className="font-display text-4xl leading-none mt-1">{match.title}</h1>
        <p className="text-sm text-muted-foreground capitalize mt-2">{dateStr} · {timeStr}</p>
      </section>

      <section className="px-4 mt-5 grid grid-cols-2 gap-3">
        <Stat label="Jugadores" value={`${participants.length}/${match.max_players}`} accent />
        <Stat label="Lugares libres" value={String(Math.max(spotsLeft, 0))} />
        <Stat label="Nivel" value={match.skill_level ?? "—"} />
        <Stat label="Por jugador" value={match.price_per_player > 0 ? `$${match.price_per_player}` : "Gratis"} accent />
      </section>

      {(match.court || match.location) && (
        <section className="px-4 mt-6">
          <h2 className="font-display text-xl leading-none mb-3">Lugar</h2>
          <div className="rounded border border-border bg-card p-3 flex items-center gap-3">
            <MapPin size={18} className="text-primary shrink-0" />
            <div className="min-w-0">
              {match.court && <p className="font-display text-lg leading-tight">{match.court.name}</p>}
              <p className="text-xs text-muted-foreground truncate">{match.court?.address ?? match.location}</p>
            </div>
          </div>
        </section>
      )}

      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3 flex items-center gap-2"><Users size={18} /> Jugadores</h2>
        <div className="space-y-2">
          <PlayerRow name={match.host_profile?.display_name ?? "Anfitrión"} label="ANFITRIÓN" />
          {participants.filter((p) => p.user_id !== match.host_id).map((p) => (
            <PlayerRow key={p.user_id} name={p.profiles?.display_name ?? "Jugador"} />
          ))}
        </div>
      </section>

      {match.notes && (
        <section className="px-4 mt-6">
          <h2 className="font-display text-xl leading-none mb-2 flex items-center gap-2"><Clock size={16} /> Notas</h2>
          <p className="text-sm text-muted-foreground rounded border border-border bg-card p-3">{match.notes}</p>
        </section>
      )}

      {!isHost && (
        <div className="fixed bottom-[72px] inset-x-0 z-40 px-4 py-3 border-t border-border backdrop-blur-md bg-background/85">
          <div className="mx-auto max-w-screen-md">
            {joined ? (
              <button onClick={leave} disabled={acting}
                className="w-full h-12 rounded-sm bg-card border border-destructive text-destructive font-bold uppercase tracking-widest text-sm">
                {acting ? "..." : "Salir del partido"}
              </button>
            ) : (
              <button onClick={join} disabled={acting || spotsLeft <= 0}
                className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm glow-green hover:brightness-110 disabled:opacity-50">
                {acting ? "..." : spotsLeft <= 0 ? "Cupo lleno" : `Unirme${match.price_per_player > 0 ? ` — $${match.price_per_player}` : ""}`}
              </button>
            )}
          </div>
        </div>
      )}
      <div className="h-20" />
    </AppShell>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="rounded border border-border bg-card p-3">
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</p>
    <p className={`mt-1 font-display text-2xl leading-none capitalize ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
  </div>
);

const PlayerRow = ({ name, label }: { name: string; label?: string }) => (
  <div className="flex items-center gap-3 rounded border border-border bg-card p-3">
    <InitialsAvatar name={name} size={40} />
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm truncate">{name}</p>
      {label && <p className="text-[10px] uppercase tracking-widest font-mono text-primary">{label}</p>}
    </div>
  </div>
);

export default MatchDetail;
