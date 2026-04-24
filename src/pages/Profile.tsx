import { Link } from "react-router-dom";
import { Settings, LogOut, Check, ArrowUpRight, Share, BarChart3, ChevronRight, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RankingChart } from "@/components/playon/RankingChart";
import { SportCard } from "@/components/playon/SportCard";
import { Heatmap } from "@/components/playon/Heatmap";

const Profile = () => {
  return (
    <AppShell subtitle="CV Deportivo">
      {/* Hero profile card */}
      <section
        className="relative px-5 pt-6 pb-7 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(150 60% 6%) 0%, hsl(var(--background)) 100%)",
        }}
      >
        <div className="absolute inset-0 field-grid opacity-60 pointer-events-none" />

        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <div className="relative" style={{ width: 120, height: 120 }}>
            <div
              className="w-full h-full rounded-full flex items-center justify-center glow-green"
              style={{
                border: "3px solid hsl(var(--primary))",
                background: "radial-gradient(circle at 30% 25%, hsl(150 40% 10%) 0%, hsl(var(--background)) 100%)",
              }}
            >
              <span className="font-display text-primary" style={{ fontSize: 48, lineHeight: 1 }}>
                AP
              </span>
            </div>
            <div
              className="absolute flex items-center justify-center rounded-full"
              style={{
                bottom: 2,
                right: 2,
                width: 28,
                height: 28,
                backgroundColor: "hsl(var(--primary))",
                border: "3px solid hsl(var(--background))",
              }}
            >
              <Check size={14} strokeWidth={3} className="text-background" />
            </div>
          </div>

          <h1
            className="font-display text-foreground text-center mt-4"
            style={{ fontSize: 32, letterSpacing: "0.04em", lineHeight: 1 }}
          >
            ANDREA POSADAS
          </h1>
          <p className="font-body text-muted-foreground text-[13px] mt-2">
            @andreaposadas · Monterrey, NL
          </p>

          <div
            className="mt-3.5 inline-flex items-center rounded-full"
            style={{
              padding: "8px 14px",
              backgroundColor: "hsl(var(--primary) / 0.1)",
              border: "1px solid hsl(var(--primary))",
            }}
          >
            <span
              className="font-condensed font-bold text-[11px] uppercase text-primary"
              style={{ letterSpacing: "0.2em" }}
            >
              ◉ Nivel Intermedio · 4.2/5
            </span>
          </div>

          <div className="flex items-stretch w-full mt-6">
            {[
              { v: "127", l: "Partidos" },
              { v: "4", l: "Deportes" },
              { v: "3 AÑOS", l: "En PlayOn" },
            ].map((s, i, arr) => (
              <div
                key={s.l}
                className={`flex-1 flex flex-col items-center text-center ${
                  i < arr.length - 1 ? "border-r border-border" : ""
                }`}
              >
                <div
                  className="font-display text-primary leading-none"
                  style={{ fontSize: s.v.length > 3 ? 26 : 36 }}
                >
                  {s.v}
                </div>
                <div
                  className="font-condensed text-[10px] uppercase text-muted-foreground mt-1.5"
                  style={{ letterSpacing: "0.15em" }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ranking */}
      <section className="px-4 mt-4">
        <div className="rounded-lg border border-border p-5 bg-card">
          <p
            className="font-condensed font-semibold text-[11px] uppercase text-primary"
            style={{ letterSpacing: "0.25em" }}
          >
            Ranking en Monterrey
          </p>
          <div className="flex items-end justify-between gap-3 mt-2">
            <div className="font-display text-foreground" style={{ fontSize: 64, lineHeight: 1 }}>
              #247
            </div>
            <div className="pb-1">
              <RankingChart />
            </div>
          </div>
          <p className="font-body text-[12px] text-primary mt-3 flex items-center gap-1">
            <ArrowUpRight size={14} strokeWidth={2.5} />
            Subiste 53 posiciones este mes
          </p>
        </div>
      </section>

      {/* My Sports */}
      <section className="px-4 mt-8">
        <h2 className="font-display text-foreground" style={{ fontSize: 24, lineHeight: 1 }}>
          MIS DEPORTES
        </h2>
        <p className="font-body text-[12px] text-muted-foreground mt-1">
          Stats acumulados por deporte
        </p>

        <div className="flex flex-col gap-3 mt-4">
          <SportCard
            icon="⚽"
            name="FÚTBOL 7"
            subtitle="Delantero · Pie Derecho"
            level="AVANZADO"
            elo="1,847"
            accent="football"
            stats={[
              { value: "64", label: "Partidos" },
              { value: "48", label: "Goles" },
              { value: "31", label: "Asistencias" },
            ]}
            achievements={[
              "🏆 Campeón Liga PlayOn Primavera 2025",
              "⚡ Goleador del Torneo · 12 Goles",
              "🔥 Racha de 5 Victorias",
            ]}
            winRate={78}
            record="50V · 14D"
          />
          <SportCard
            icon="🎾"
            name="TENIS"
            subtitle="Mano Derecha · Revés a Dos Manos"
            level="INTERMEDIO"
            elo="1,420"
            accent="tennis"
            stats={[
              { value: "32", label: "Partidos" },
              { value: "19", label: "Victorias" },
              { value: "4", label: "Torneos" },
            ]}
            achievements={[
              "🥉 3er Lugar · Torneo San Pedro 2025",
              "🔥 8 Victorias Consecutivas",
              "⚡ Mejor Servicio de la Liga",
            ]}
            winRate={59}
            record="19V · 13D"
          />
          <SportCard
            icon="🏀"
            name="BÁSQUETBOL"
            subtitle="Escolta · 1.82m"
            level="INTERMEDIO"
            elo="1,380"
            accent="basket"
            stats={[
              { value: "19", label: "Partidos" },
              { value: "14.2", label: "Pts/Juego" },
              { value: "6.1", label: "Asist/Juego" },
            ]}
            achievements={[
              "🏀 Triple Doble · 15 PTS · 12 REB · 10 AST",
              "🔥 Racha de 6 Victorias",
              "⚡ MVP de la Jornada · Mar 2025",
            ]}
            winRate={68}
            record="13V · 6D"
          />
          <SportCard
            icon="🏐"
            name="VOLEIBOL"
            subtitle="Opuesto · Ataque Rápido"
            level="PRINCIPIANTE"
            elo="1,180"
            accent="volley"
            stats={[
              { value: "12", label: "Partidos" },
              { value: "89", label: "Puntos" },
              { value: "23", label: "Bloqueos" },
            ]}
            achievements={[
              "🏐 Debut en PlayOn · Abr 2025",
              "⚡ Racha de 3 Victorias Seguidas",
            ]}
            winRate={50}
            record="6V · 6D"
          />
        </div>
      </section>

      {/* Tournaments */}
      <section className="px-4 mt-10">
        <h2 className="font-display text-foreground" style={{ fontSize: 24, lineHeight: 1 }}>
          TORNEOS DISPUTADOS
        </h2>
        <p className="font-body text-[12px] text-muted-foreground mt-1">
          Historial de competencias oficiales
        </p>

        <div className="flex flex-col gap-2 mt-4">
          {[
            { icon: "⚽", name: "Liga PlayOn Primavera 2026", date: "ABR 2026 · MONTERREY", badge: "🏆 CAMPEÓN", color: "hsl(var(--trophy))", bg: "hsl(var(--trophy) / 0.15)" },
            { icon: "🎾", name: "Torneo San Pedro Open", date: "MAR 2026 · SAN PEDRO", badge: "🥉 3ER LUGAR", color: "hsl(var(--trophy))", bg: "hsl(var(--trophy) / 0.12)" },
            { icon: "🏀", name: "Copa 3×3 Cumbres", date: "FEB 2026 · CUMBRES", badge: "SEMIFINAL", color: "hsl(var(--sport-basket))", bg: "hsl(var(--sport-basket) / 0.12)" },
            { icon: "⚽", name: "Liga PlayOn Invierno 2025", date: "DIC 2025 · MONTERREY", badge: "🥈 SUBCAMPEÓN", color: "hsl(0 0% 80%)", bg: "hsl(0 0% 100% / 0.08)" },
            { icon: "🏐", name: "Torneo Inaugural Voleibol", date: "NOV 2025 · VALLE ORIENTE", badge: "PARTICIPANTE", color: "hsl(var(--muted-foreground))", bg: "hsl(0 0% 100% / 0.05)" },
            { icon: "🎾", name: "Copa Tec de Monterrey", date: "SEP 2025 · MONTERREY", badge: "CUARTOS DE FINAL", color: "hsl(var(--sport-tennis))", bg: "hsl(var(--sport-tennis) / 0.12)" },
          ].map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card"
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-md"
                style={{ width: 36, height: 36, background: "hsl(0 0% 12%)" }}
              >
                <span style={{ fontSize: 18 }}>{t.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-body font-bold text-[13.5px] text-foreground leading-tight truncate">
                  {t.name}
                </p>
                <p className="font-mono-tech text-[10px] text-muted-foreground mt-0.5">
                  {t.date}
                </p>
              </div>
              <span
                className="shrink-0 font-condensed font-bold text-[10px] uppercase px-2.5 py-1.5 rounded"
                style={{ letterSpacing: "0.08em", color: t.color, backgroundColor: t.bg }}
              >
                {t.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* My Teams */}
      <section className="mt-10">
        <div className="px-4">
          <h2 className="font-display text-foreground" style={{ fontSize: 24, lineHeight: 1 }}>
            MIS EQUIPOS
          </h2>
          <p className="font-body text-[12px] text-muted-foreground mt-1">
            Clubes y equipos activos
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar mt-4 px-4 pb-1">
          {[
            { initials: "LT", name: "LOS TIGRES DE MTY", meta: "⚽ FÚTBOL 7 · MIÉ 8PM", stats: "14 miembros · 3 trofeos" },
            { initials: "PD", name: "PÁDEL CREW", meta: "🏓 PÁDEL · VIE 7PM", stats: "8 miembros · 1 trofeo" },
            { initials: "CB", name: "CANCHA BROTHERS", meta: "🏀 BASKET · DOM 10AM", stats: "10 miembros · nuevo" },
          ].map((t) => (
            <div
              key={t.initials}
              className="shrink-0 rounded-lg border border-border p-4 bg-card"
              style={{ width: 180 }}
            >
              <div
                className="rounded-full flex items-center justify-center mb-3"
                style={{
                  width: 60,
                  height: 60,
                  background: "radial-gradient(circle at 30% 25%, hsl(150 40% 10%) 0%, hsl(var(--background)) 100%)",
                  border: "2px solid hsl(var(--primary) / 0.6)",
                }}
              >
                <span className="font-display text-primary" style={{ fontSize: 26, lineHeight: 1 }}>
                  {t.initials}
                </span>
              </div>
              <p className="font-body font-bold text-[13px] text-foreground leading-tight">
                {t.name}
              </p>
              <p className="font-condensed text-[10px] uppercase text-muted-foreground mt-1.5" style={{ letterSpacing: "0.08em" }}>
                {t.meta}
              </p>
              <p className="font-mono-tech text-[10px] text-muted-foreground mt-2">
                {t.stats}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Activity heatmap */}
      <section className="px-4 mt-10">
        <div className="rounded-lg border border-border p-5 bg-card">
          <h2 className="font-display text-foreground" style={{ fontSize: 20, lineHeight: 1 }}>
            ACTIVIDAD DEL AÑO
          </h2>
          <p className="font-body text-[11px] text-muted-foreground mt-1 mb-4">
            127 partidos jugados · 2025-2026
          </p>
          <Heatmap />
        </div>
      </section>

      {/* Next matches */}
      <section className="px-4 mt-10">
        <h2 className="font-display text-foreground" style={{ fontSize: 20, lineHeight: 1 }}>
          PRÓXIMOS PARTIDOS
        </h2>

        <div className="flex flex-col gap-2.5 mt-3">
          {[
            { icon: "⚽", league: "Liga PlayOn · J14", title: "Tigres MTY vs. Cancha Club", when: "Mié 24 Abr · 8:00 PM · Sporti Valle", count: "EN 2 DÍAS" },
            { icon: "🎾", league: "Torneo Pádel Nation", title: "vs. Carlos Mendoza", when: "Sáb 27 Abr · 10:00 AM · Padel Nation", count: "EN 5 DÍAS" },
          ].map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card"
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-full"
                style={{ width: 40, height: 40, background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.4)" }}
              >
                <span style={{ fontSize: 18 }}>{m.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-body text-[11px] uppercase text-primary tracking-wider">
                  {m.league}
                </p>
                <p className="font-body font-bold text-[14px] text-foreground leading-tight mt-0.5 truncate">
                  {m.title}
                </p>
                <p className="font-body text-[11px] text-muted-foreground mt-0.5 truncate">
                  {m.when}
                </p>
              </div>
              <span
                className="shrink-0 font-condensed font-bold text-[9px] uppercase px-2 py-1 rounded"
                style={{
                  letterSpacing: "0.1em",
                  color: "hsl(var(--primary))",
                  backgroundColor: "hsl(var(--primary) / 0.12)",
                  border: "1px solid hsl(var(--primary) / 0.4)",
                }}
              >
                {m.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Share CTA */}
      <section className="px-4 mt-10 flex justify-center">
        <button
          className="inline-flex items-center gap-2.5 rounded transition-transform active:scale-[0.98] bg-primary text-primary-foreground glow-green"
          style={{ padding: "16px 28px" }}
        >
          <Share size={18} strokeWidth={2.25} />
          <span className="font-display" style={{ fontSize: 16, letterSpacing: "0.18em" }}>
            COMPARTIR MI CV DEPORTIVO →
          </span>
        </button>
      </section>

      {/* Owner switch */}
      <section className="px-4 mt-8">
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
