import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { leagues, sportLabels } from "@/data/mock";
import { Trophy } from "lucide-react";
import { EventosHub } from "@/components/EventosHub";
import { ConectaHub } from "@/components/ConectaHub";

type Tab = "eventos" | "conecta" | "ligas";

const tabs: { id: Tab; label: string }[] = [
  { id: "eventos", label: "Eventos" },
  { id: "conecta", label: "Conecta" },
  { id: "ligas", label: "Ligas" },
];

const leaderboard = [
  { rank: 1, name: "Carlos V.", colonia: "San Pedro", points: 1840 },
  { rank: 2, name: "Diego R.", colonia: "Centro", points: 1720 },
  { rank: 3, name: "Alejandro R.", colonia: "Cumbres", points: 1655, you: true },
  { rank: 4, name: "Mariana L.", colonia: "Valle", points: 1490 },
  { rank: 5, name: "Jorge T.", colonia: "Centro", points: 1380 },
];

const challenges = [
  { title: "Juega 3 partidos", progress: 2, total: 3, reward: "+50 pts" },
  { title: "Invita a un amigo", progress: 0, total: 1, reward: "+100 pts" },
  { title: "Reseña una cancha", progress: 1, total: 1, reward: "+30 pts", done: true },
];

const Community = () => {
  const [tab, setTab] = useState<Tab>("eventos");
  const league = leagues[0];

  return (
    <AppShell subtitle="Comunidad">
      <section className="px-4 pt-5">
        <h1 className="font-display text-4xl leading-none">COMUNIDAD MTY</h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mt-1">
          Compite, sube de nivel
        </p>
      </section>

      {/* Tabs */}
      <section className="px-4 mt-5">
        <div className="flex gap-1 p-1 rounded-full border border-border bg-card">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 h-9 rounded-full text-[11px] font-bold uppercase tracking-widest font-mono transition-all ${
                  active
                    ? "bg-primary text-primary-foreground glow-green"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {tab === "eventos" && (
        <div className="pb-8">
          <EventosHub />
        </div>
      )}

      {tab === "conecta" && (
        <div className="pb-8">
          <ConectaHub />
        </div>
      )}

      {tab === "ligas" && (
        <section className="px-4 mt-5 mb-8">
          <div className="relative overflow-hidden rounded border border-primary/40 bg-card p-5">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-primary">
                <Trophy size={14} /> Liga destacada
              </div>
              <h2 className="font-display text-3xl mt-2 leading-tight">{league.name}</h2>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {sportLabels[league.sport]} · {league.format}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Equipos" value={`${league.teams}/${league.maxTeams}`} />
                <Stat label="Premio" value={league.prize} small />
                <Stat label="Inicio" value="15 May" />
              </div>
              <button className="mt-4 w-full h-11 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs font-mono glow-green hover:glow-green-strong transition-all">
                Inscribir equipo
              </button>
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
};

const Stat = ({ label, value, small }: { label: string; value: string; small?: boolean }) => (
  <div>
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</p>
    <p className={`font-display ${small ? "text-base" : "text-2xl"} leading-tight text-foreground mt-0.5`}>
      {value}
    </p>
  </div>
);

export default Community;
