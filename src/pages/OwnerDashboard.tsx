import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar, Star, DollarSign } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { courts } from "@/data/mock";

const occupancyByDay = [
  { day: "L", pct: 65 },
  { day: "M", pct: 72 },
  { day: "X", pct: 80 },
  { day: "J", pct: 78 },
  { day: "V", pct: 92 },
  { day: "S", pct: 98 },
  { day: "D", pct: 88 },
];

const upcomingBookings = [
  { id: "b1", court: "Fan Soccer", time: "Hoy · 18:00", who: "Diego R.", price: 650 },
  { id: "b2", court: "Fan Soccer", time: "Hoy · 19:00", who: "Mariana L.", price: 650 },
  { id: "b3", court: "Fan Soccer", time: "Mañana · 16:00", who: "Carlos V.", price: 650 },
];

const OwnerDashboard = () => {
  const myCourt = courts[0];
  return (
    <AppShell subtitle="Dueño · Dashboard">
      <div className="px-4 pt-3 flex items-center gap-3">
        <Link to="/profile" className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Cancha</p>
          <h1 className="font-display text-3xl leading-none">{myCourt.name.toUpperCase()}</h1>
        </div>
      </div>

      {/* Revenue hero */}
      <section className="px-4 mt-5">
        <div className="relative overflow-hidden rounded border border-primary/40 bg-card p-5">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
              <DollarSign size={12} /> Ingresos del mes
            </p>
            <p className="font-display text-6xl text-primary leading-none mt-2 text-glow">
              $48,250
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-2 flex items-center gap-1">
              <TrendingUp size={12} className="text-primary" />
              <span className="text-primary">+18%</span> vs mes anterior
            </p>
          </div>
        </div>
      </section>

      {/* Occupancy chart */}
      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3">Ocupación esta semana</h2>
        <div className="rounded border border-border bg-card p-4">
          <div className="flex items-end justify-between gap-2 h-32">
            {occupancyByDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-sm bg-gradient-primary"
                    style={{ height: `${d.pct}%` }}
                    title={`${d.pct}%`}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Promedio</span>
            <span className="text-primary font-bold">82%</span>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="px-4 mt-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display text-xl leading-none flex items-center gap-2">
            <Calendar size={18} className="text-primary" /> Próximas reservas
          </h2>
          <button className="text-[10px] uppercase tracking-widest font-mono text-primary">Ver todas</button>
        </div>
        <div className="rounded border border-border bg-card divide-y divide-border">
          {upcomingBookings.map((b) => (
            <div key={b.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{b.who}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{b.time}</p>
              </div>
              <span className="font-mono text-sm text-primary">${b.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing toggle */}
      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3">Precios</h2>
        <div className="rounded border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Precios dinámicos</p>
              <p className="text-[11px] text-muted-foreground">Ajusta automáticamente por demanda</p>
            </div>
            <Toggle />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm">Precio base por hora</span>
            <span className="font-mono text-sm">
              <span className="text-primary">${myCourt.pricePerHour}</span>
              <span className="text-muted-foreground">/hr</span>
            </span>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-4 mt-6 mb-8">
        <h2 className="font-display text-xl leading-none mb-3 flex items-center gap-2">
          <Star size={18} className="text-primary fill-primary" /> Reseñas recientes
        </h2>
        <div className="space-y-2">
          {[
            { name: "Mariana L.", text: "Increíble cancha, regreso seguro." },
            { name: "Jorge T.", text: "Buen servicio. Iluminación top." },
          ].map((r, i) => (
            <div key={i} className="rounded border border-border bg-card p-3">
              <p className="text-sm font-semibold">{r.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

const Toggle = () => {
  return (
    <button
      type="button"
      onClick={(e) => e.currentTarget.classList.toggle("on")}
      className="relative h-6 w-11 rounded-full bg-secondary border border-border [&.on]:bg-primary transition-colors group"
      aria-label="Activar precios dinámicos"
    >
      <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-foreground transition-transform group-[.on]:translate-x-5 group-[.on]:bg-primary-foreground" />
    </button>
  );
};

export default OwnerDashboard;
