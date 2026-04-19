import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { MatchCard } from "@/components/MatchCard";
import { openMatches } from "@/data/mock";
import { Plus } from "lucide-react";

type Tab = "upcoming" | "past" | "cancelled";

const tabs: { id: Tab; label: string }[] = [
  { id: "upcoming", label: "Próximos" },
  { id: "past", label: "Pasados" },
  { id: "cancelled", label: "Cancelados" },
];

const Matches = () => {
  const [tab, setTab] = useState<Tab>("upcoming");

  return (
    <AppShell subtitle="Mis partidos">
      <section className="px-4 pt-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none">MIS PARTIDOS</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mt-1">
            Tu agenda de juego
          </p>
        </div>
        <Link
          to="/matches/new"
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-sm bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest font-mono glow-green hover:glow-green-strong transition-all"
        >
          <Plus size={16} /> Crear
        </Link>
      </section>

      <section className="mt-5 border-b border-border">
        <div className="flex gap-1 px-4">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative h-11 px-4 text-xs font-bold uppercase tracking-widest font-mono transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {active && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-5 space-y-3">
        {tab === "upcoming" ? (
          openMatches.slice(0, 2).map((m) => <MatchCard key={m.id} match={m} />)
        ) : (
          <div className="rounded border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {tab === "past" ? "Aún no tienes partidos pasados." : "No hay partidos cancelados."}
            </p>
            <Link to="/" className="mt-3 inline-block text-xs uppercase tracking-widest font-mono text-primary">
              Explorar partidos →
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
};

export default Matches;
