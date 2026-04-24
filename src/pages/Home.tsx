import { useState } from "react";
import { Search, Trophy, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CourtCard } from "@/components/CourtCard";
import { MatchCard } from "@/components/MatchCard";
import { Link } from "react-router-dom";
import { courts, openMatches, leagues, sportLabels, Sport } from "@/data/mock";

type Filter = "all" | Sport;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "futbol", label: "Fútbol" },
  { id: "tenis", label: "Tenis" },
  { id: "padel", label: "Pádel" },
];

const Home = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const filteredCourts = filter === "all" ? courts : courts.filter((c) => c.sport === filter);
  const filteredMatches = filter === "all" ? openMatches : openMatches.filter((m) => m.sport === filter);

  return (
    <AppShell subtitle="Monterrey, MX">
      {/* Hero greeting */}
      <section className="px-4 pt-5 animate-fade-up">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
          Hola, Andrea
        </p>
        <h1 className="font-display text-4xl mt-1 leading-none">
          EL JUEGO <span className="text-primary text-glow">EMPIEZA</span> AQUÍ
        </h1>
      </section>

      {/* Search */}
      <section className="px-4 mt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar cancha cerca de ti..."
            className="w-full h-12 pl-10 pr-4 rounded bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors text-sm placeholder:text-muted-foreground"
          />
        </div>
      </section>

      {/* Filter chips */}
      <section className="mt-4 px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 h-9 px-4 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary glow-green"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Courts available today */}
      <section className="mt-7">
        <SectionHeader title="Canchas disponibles hoy" cta="Ver todas" to="/courts" />
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
          {filteredCourts.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
          {filteredCourts.length === 0 && <EmptyState text="No hay canchas para este deporte." />}
        </div>
      </section>

      {/* Open matches */}
      <section className="mt-7">
        <SectionHeader title="Partidos abiertos" cta="Crear partido" to="/matches/new" />
        <div className="px-4 space-y-3">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((m) => <MatchCard key={m.id} match={m} />)
          ) : (
            <EmptyState text="Todavía no hay partidos. Crea el primero." />
          )}
        </div>
      </section>

      {/* Leagues */}
      <section className="mt-7 mb-8">
        <SectionHeader title="Ligas activas" cta="Explorar" to="/community" />
        <div className="px-4 space-y-3">
          {leagues.map((l) => (
            <Link
              key={l.id}
              to="/community"
              className="block relative overflow-hidden rounded border border-border bg-card p-5 hover:border-primary/50 transition-colors"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-primary">
                  <Trophy size={14} /> {sportLabels[l.sport]} · {l.format}
                </div>
                <h3 className="font-display text-2xl mt-2 leading-tight">{l.name}</h3>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  <span>
                    <span className="text-foreground font-bold">{l.teams}</span>/{l.maxTeams} equipos
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-primary" /> {l.prize}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

const SectionHeader = ({ title, cta, to }: { title: string; cta: string; to: string }) => (
  <div className="flex items-end justify-between px-4 mb-3">
    <h2 className="font-display text-2xl leading-none">{title}</h2>
    <Link to={to} className="text-xs uppercase tracking-widest font-mono text-primary hover:text-glow">
      {cta} →
    </Link>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
    {text}
  </div>
);

export default Home;
