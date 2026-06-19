import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Search, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Filter = "all" | "futbol" | "tenis" | "padel" | "basquetbol" | "pickleball";
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" }, { id: "futbol", label: "Fútbol" }, { id: "tenis", label: "Tenis" },
  { id: "padel", label: "Pádel" }, { id: "basquetbol", label: "Básquet" }, { id: "pickleball", label: "Pickleball" },
];

const SPORT_ICON: Record<string, string> = {
  futbol: "⚽", tenis: "🎾", padel: "🎾", basquetbol: "🏀", pickleball: "🥒", voleibol: "🏐",
};

interface Court {
  id: string; name: string; sport: string; address: string; municipio: string | null;
  price_per_hour: number; amenities: string[]; image_url: string | null;
}

const Courts = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("courts").select("*").eq("is_active", true).order("name").then(({ data }) => {
      setCourts((data as Court[]) ?? []); setLoading(false);
    });
  }, []);

  const list = courts
    .filter((c) => filter === "all" || c.sport === filter)
    .filter((c) => {
      const t = q.toLowerCase();
      return !t || c.name.toLowerCase().includes(t) || (c.municipio?.toLowerCase().includes(t)) || c.address.toLowerCase().includes(t);
    });

  return (
    <AppShell subtitle="Canchas">
      <section className="px-4 pt-5">
        <h1 className="font-display text-4xl leading-none">CANCHAS EN MTY</h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mt-1">
          {loading ? "Cargando..." : `${list.length} disponibles`}
        </p>
      </section>

      <section className="px-4 mt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Buscar por nombre, colonia..."
            className="w-full h-12 pl-10 pr-4 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm" />
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 h-9 px-4 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono ${active ? "bg-primary text-primary-foreground border-primary glow-green" : "bg-card text-muted-foreground border-border"}`}>
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-5 space-y-3 pb-8">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div>
        ) : list.length === 0 ? (
          <div className="rounded border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No encontramos canchas. Prueba con otro filtro.
          </div>
        ) : (
          list.map((c) => (
            <Link key={c.id} to={`/courts/${c.id}`}
              className="block rounded border border-border bg-card p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl shrink-0">
                  {SPORT_ICON[c.sport] ?? "🏟️"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg leading-tight">{c.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin size={11} /> {c.municipio ?? c.address}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-display text-primary">${c.price_per_hour}<span className="text-xs text-muted-foreground font-mono">/hr</span></span>
                    {c.amenities.slice(0, 2).map((a) => (
                      <span key={a} className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">· {a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </AppShell>
  );
};

export default Courts;
