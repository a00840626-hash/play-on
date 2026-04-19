import { Link } from "react-router-dom";
import { Settings, LogOut, Award, ChevronRight, BarChart3, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SportBadge } from "@/components/SportBadge";
import { currentUser } from "@/data/mock";

const Profile = () => {
  return (
    <AppShell subtitle="Perfil">
      <section className="px-4 pt-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center font-display text-4xl text-primary-foreground glow-green">
            {currentUser.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl leading-none">{currentUser.name}</h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mt-1">
              Nivel · <span className="text-primary">{currentUser.level}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 mt-6 grid grid-cols-3 gap-3">
        <StatBlock value={String(currentUser.matchesPlayed)} label="Partidos" />
        <StatBlock value={`${currentUser.winRate}%`} label="Win rate" accent />
        <StatBlock value={String(currentUser.hoursPlayed)} label="Horas" />
      </section>

      {/* Sports */}
      <section className="px-4 mt-7">
        <h2 className="font-display text-xl leading-none mb-3">Mis deportes</h2>
        <div className="space-y-2">
          {currentUser.sports.map((s) => (
            <div key={s.sport} className="flex items-center justify-between rounded border border-border bg-card p-3">
              <SportBadge sport={s.sport} />
              <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                Nivel · <span className="text-primary">{s.skill}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="px-4 mt-7">
        <h2 className="font-display text-xl leading-none mb-3 flex items-center gap-2">
          <Award size={18} className="text-primary" /> Logros
        </h2>
        <div className="space-y-2">
          {currentUser.achievements.map((a, i) => (
            <div key={i} className="flex items-start gap-3 rounded border border-border bg-card p-3">
              <div className="h-10 w-10 rounded-sm bg-primary/15 border border-primary/40 flex items-center justify-center">
                <Award size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Owner switch */}
      <section className="px-4 mt-7">
        <Link
          to="/owner"
          className="flex items-center justify-between rounded border border-primary/40 bg-card p-4 hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-primary" />
            <div>
              <p className="font-display text-lg leading-none">DASHBOARD DE CANCHA</p>
              <p className="text-xs text-muted-foreground mt-0.5">Vista para dueños</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
      </section>

      {/* Settings */}
      <section className="px-4 mt-5 mb-8 space-y-2">
        <SettingsRow icon={Settings} label="Configuración" />
        <SettingsRow icon={LogOut} label="Cerrar sesión" danger />
      </section>
    </AppShell>
  );
};

const StatBlock = ({ value, label, accent }: { value: string; label: string; accent?: boolean }) => (
  <div className="rounded border border-border bg-card p-3 text-center">
    <p className={`font-display text-3xl leading-none ${accent ? "text-primary text-glow" : "text-foreground"}`}>
      {value}
    </p>
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mt-1">{label}</p>
  </div>
);

const SettingsRow = ({
  icon: Icon,
  label,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
}) => (
  <button
    type="button"
    className={`w-full flex items-center justify-between rounded border border-border bg-card p-3 hover:border-foreground/40 transition-colors ${
      danger ? "text-accent" : ""
    }`}
  >
    <span className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm font-semibold">{label}</span>
    </span>
    <ChevronRight size={16} className="text-muted-foreground" />
  </button>
);

export default Profile;
