import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CourtCard } from "@/components/CourtCard";
import { courts, sportLabels, Sport } from "@/data/mock";
import { Search } from "lucide-react";

type Filter = "all" | Sport;
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "futbol", label: "Fútbol" },
  { id: "tenis", label: "Tenis" },
  { id: "padel", label: "Pádel" },
];

const Courts = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const list = courts
    .filter((c) => filter === "all" || c.sport === filter)
    .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.neighborhood.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell subtitle="Canchas">
      <section className="px-4 pt-5">
        <h1 className="font-display text-4xl leading-none">CANCHAS EN MTY</h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mt-1">
          {list.length} disponibles
        </p>
      </section>

      <section className="px-4 mt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Buscar por nombre o colonia..."
            className="w-full h-12 pl-10 pr-4 rounded bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm placeholder:text-muted-foreground"
          />
        </div>
      </section>

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
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-5 space-y-3">
        {list.length > 0 ? (
          list.map((court) => <CourtCard key={court.id} court={court} variant="vertical" />)
        ) : (
          <div className="rounded border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No encontramos canchas de {filter !== "all" && sportLabels[filter as Sport]}. Prueba con otro filtro.
          </div>
        )}
      </section>
    </AppShell>
  );
};

export default Courts;
