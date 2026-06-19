import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Plus, MapPin, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Tab = "upcoming" | "mine" | "past";
const tabs: { id: Tab; label: string }[] = [
  { id: "upcoming", label: "Próximos" },
  { id: "mine", label: "Mis partidos" },
  { id: "past", label: "Pasados" },
];

interface Match {
  id: string; sport: string; title: string; starts_at: string; location: string | null;
  max_players: number; price_per_player: number; skill_level: string | null; host_id: string;
  match_participants: { user_id: string }[];
}

const SPORT_ICON: Record<string, string> = {
  futbol: "⚽", tenis: "🎾", padel: "🎾", basquetbol: "🏀", pickleball: "🥒", voleibol: "🏐",
};

const Matches = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const now = new Date().toISOString();
    let q = supabase.from("matches").select("*, match_participants(user_id)").order("starts_at", { ascending: tab !== "past" });
    if (tab === "upcoming") q = q.gte("starts_at", now);
    else if (tab === "past") q = q.lt("starts_at", now);
    else if (tab === "mine" && user) q = q.eq("host_id", user.id);
    q.then(({ data }) => {
      let list = (data as any as Match[]) ?? [];
      if (tab === "mine" && user) {
        // also include matches the user joined
        supabase.from("match_participants").select("match_id").eq("user_id", user.id).then(({ data: parts }) => {
          const joinedIds = new Set((parts ?? []).map((p) => p.match_id));
          const extra = list.filter((m) => joinedIds.has(m.id));
          supabase.from("matches").select("*, match_participants(user_id)").in("id", Array.from(joinedIds)).then(({ data: joined }) => {
            const merged = [...list, ...((joined as any) ?? [])].reduce<Record<string, Match>>((acc, m) => { acc[m.id] = m; return acc; }, {});
            setMatches(Object.values(merged).sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
            setLoading(false);
          });
        });
      } else {
        setMatches(list);
        setLoading(false);
      }
    });
  }, [tab, user]);

  return (
    <AppShell subtitle="Mis partidos">
      <section className="px-4 pt-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none">PARTIDOS</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mt-1">Únete o crea un partido</p>
        </div>
        <Link to="/matches/new" className="inline-flex items-center gap-1.5 h-10 px-3 rounded-sm bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest font-mono glow-green hover:brightness-110">
          <Plus size={16} /> Crear
        </Link>
      </section>

      <section className="mt-5 border-b border-border">
        <div className="flex gap-1 px-4">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative h-11 px-4 text-xs font-bold uppercase tracking-widest font-mono transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label}
                {active && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-5 space-y-3 pb-8">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div>
        ) : matches.length === 0 ? (
          <div className="rounded border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No hay partidos por aquí.</p>
            <Link to="/matches/new" className="mt-3 inline-block text-xs uppercase tracking-widest font-mono text-primary">Crear el primero →</Link>
          </div>
        ) : (
          matches.map((m) => {
            const d = new Date(m.starts_at);
            const dateStr = d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
            const timeStr = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
            const joined = m.match_participants?.length ?? 0;
            return (
              <Link key={m.id} to={`/matches/${m.id}`}
                className="block rounded border border-border bg-card p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xl">
                    {SPORT_ICON[m.sport] ?? "🏟️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg leading-tight truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{dateStr} · {timeStr}</p>
                    {m.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin size={11} /> {m.location}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs flex items-center gap-1 text-primary"><Users size={12} /> {joined}/{m.max_players}</span>
                      {m.price_per_player > 0 && <span className="text-xs font-mono text-muted-foreground">${m.price_per_player}/jugador</span>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </AppShell>
  );
};

export default Matches;
