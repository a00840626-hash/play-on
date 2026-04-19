import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Car, Droplet, Lightbulb, Coffee, Building2, Users as UsersIcon, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SportBadge } from "@/components/SportBadge";
import { courts } from "@/data/mock";
import { toast } from "sonner";

const amenityIcons: Record<string, LucideIcon> = {
  Estacionamiento: Car,
  Regaderas: Droplet,
  Iluminación: Lightbulb,
  Cafetería: Coffee,
  Techado: Building2,
  Gradas: UsersIcon,
  "Pro Shop": Building2,
};

const CourtDetail = () => {
  const { id } = useParams();
  const court = courts.find((c) => c.id === id);

  if (!court) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Cancha no encontrada.</p>
          <Link to="/" className="text-primary text-sm mt-3 inline-block">← Volver</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell subtitle={court.neighborhood}>
      {/* Hero */}
      <div className="relative">
        <img
          src={court.image}
          alt={court.name}
          width={1280}
          height={896}
          className="w-full aspect-[4/3] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <Link
          to="/"
          className="absolute top-3 left-3 h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border"
          aria-label="Volver"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="absolute bottom-4 left-4 right-4">
          <SportBadge sport={court.sport} />
          <h1 className="font-display text-4xl mt-2 leading-none">{court.name}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-foreground/90">
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-primary text-primary" />
              <span className="font-semibold">{court.rating}</span>
              <span className="text-muted-foreground">({court.reviewCount})</span>
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={14} /> {court.distanceKm} km
            </span>
          </div>
        </div>
      </div>

      {/* Address */}
      <section className="px-4 mt-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Dirección</p>
        <p className="text-sm mt-1">{court.address}, Monterrey</p>
      </section>

      {/* Amenities */}
      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3">Amenidades</h2>
        <div className="flex flex-wrap gap-2">
          {court.amenities.map((a) => {
            const Icon = amenityIcons[a] ?? Building2;
            return (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-sm bg-card border border-border text-xs"
              >
                <Icon size={14} className="text-primary" /> {a}
              </span>
            );
          })}
        </div>
      </section>

      {/* Slots */}
      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3">Horarios disponibles hoy</h2>
        <div className="grid grid-cols-4 gap-2">
          {court.slots.map((s) => (
            <button
              key={s.time}
              disabled={!s.available}
              className={`h-12 rounded-sm border font-mono text-sm font-semibold transition-all ${
                s.available
                  ? "bg-card border-border hover:border-primary hover:text-primary"
                  : "bg-secondary/40 border-border text-muted-foreground line-through cursor-not-allowed"
              }`}
            >
              {s.time}
            </button>
          ))}
        </div>
      </section>

      {/* Map placeholder */}
      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3">Ubicación</h2>
        <div className="aspect-[16/9] rounded border border-border bg-card flex items-center justify-center">
          <div className="text-center">
            <MapPin size={32} className="text-primary mx-auto" />
            <p className="text-xs text-muted-foreground mt-2 font-mono">{court.neighborhood}, MTY</p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3">Reseñas</h2>
        <div className="space-y-3">
          {[
            { name: "Mariana L.", rating: 5, text: "Excelente cancha, muy bien iluminada y siempre limpia." },
            { name: "Jorge T.", rating: 4, text: "Buen lugar, fácil de llegar. El estacionamiento se llena." },
          ].map((r, i) => (
            <div key={i} className="rounded border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{r.name}</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} size={12} className="fill-primary text-primary" />
                  ))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-[72px] inset-x-0 z-40 bg-gradient-dark px-4 py-3 border-t border-border backdrop-blur-md bg-background/85">
        <div className="mx-auto max-w-screen-md flex items-center gap-3">
          <div>
            <div className="font-display text-2xl text-primary leading-none">${court.pricePerHour}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">por hora</div>
          </div>
          <button
            onClick={() => toast.success("¡Reserva confirmada!", { description: `${court.name} · 18:00` })}
            className="flex-1 h-12 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm glow-green hover:glow-green-strong transition-all active:scale-[0.98]"
          >
            Reservar
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default CourtDetail;
