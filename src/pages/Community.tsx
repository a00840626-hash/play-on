import { AppShell } from "@/components/AppShell";
import { leagues, sportLabels } from "@/data/mock";
import { Trophy, Sparkles, Target, Calendar, Award } from "lucide-react";

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
  const league = leagues[0];
  return (
    <AppShell subtitle="Comunidad">
      <section className="px-4 pt-5">
        <h1 className="font-display text-4xl leading-none">COMUNIDAD MTY</h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mt-1">
          Compite, sube de nivel
        </p>
      </section>

      {/* Featured league */}
      <section className="px-4 mt-5">
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

      {/* Leaderboard */}
      <section className="px-4 mt-7">
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display text-2xl leading-none">Ranking por colonia</h2>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Fútbol · Mensual
          </span>
        </div>
        <div className="rounded border border-border bg-card divide-y divide-border">
          {leaderboard.map((p) => (
            <div
              key={p.rank}
              className={`flex items-center gap-3 p-3 ${p.you ? "bg-primary/5" : ""}`}
            >
              <div
                className={`h-9 w-9 rounded-sm flex items-center justify-center font-display text-lg ${
                  p.rank === 1
                    ? "bg-primary text-primary-foreground"
                    : p.rank <= 3
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {p.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {p.name} {p.you && <span className="text-primary text-[10px] uppercase tracking-widest font-mono ml-1">· tú</span>}
                </p>
                <p className="text-[11px] text-muted-foreground">{p.colonia}</p>
              </div>
              <div className="font-mono text-sm">
                <span className="text-primary font-bold">{p.points}</span>
                <span className="text-muted-foreground text-[10px] ml-1">PTS</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Challenges */}
      <section className="px-4 mt-7 mb-8">
        <h2 className="font-display text-2xl leading-none mb-3 flex items-center gap-2">
          <Target size={20} className="text-primary" /> Retos semanales
        </h2>
        <div className="space-y-2">
          {challenges.map((c, i) => {
            const pct = (c.progress / c.total) * 100;
            return (
              <div key={i} className="rounded border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {c.done ? <Award size={16} className="text-primary" /> : <Sparkles size={16} className="text-primary" />}
                    <span className="text-sm font-semibold">{c.title}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-primary">{c.reward}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{c.progress}/{c.total}</span>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="font-display text-2xl leading-none mt-7 mb-3 flex items-center gap-2">
          <Calendar size={20} className="text-primary" /> Próximos eventos
        </h2>
        <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Pronto: Torneo relámpago de pádel en San Pedro.
        </div>
      </section>
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
