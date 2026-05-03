import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { PlayOnEvent, eventSportLabels, eventTypeLabels } from "@/data/events";

const sportDot: Record<string, string> = {
  futbol: "bg-primary",
  tenis: "bg-[hsl(212,100%,62%)]",
  padel: "bg-[hsl(49,100%,50%)]",
  running: "bg-accent",
};

export const EventCard = ({ event, compact }: { event: PlayOnEvent; compact?: boolean }) => {
  const d = new Date(event.date);
  const dateLabel = d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
  const timeLabel = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      to="#"
      className={`block rounded border border-border bg-card hover:border-primary/50 transition-colors ${
        compact ? "w-72 flex-shrink-0" : ""
      }`}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-20 flex-shrink-0 rounded-sm bg-secondary overflow-hidden">
          <div className={`absolute top-1 left-1 h-2 w-2 rounded-full ${sportDot[event.sport]}`} />
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover opacity-60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm border border-primary/40 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest font-mono">
              {eventSportLabels[event.sport]}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground">
              {eventTypeLabels[event.type]}
            </span>
          </div>
          <h3 className="font-display text-lg leading-tight mt-1 truncate">{event.title}</h3>
          <div className="mt-1 space-y-0.5 text-[11px] font-mono text-muted-foreground">
            <p className="flex items-center gap-1">
              <Calendar size={10} /> {dateLabel} · {timeLabel}
            </p>
            <p className="flex items-center gap-1 truncate">
              <MapPin size={10} /> {event.location.name} · {event.location.colonia}
            </p>
            <p className="flex items-center gap-1">
              <Users size={10} /> {event.current_players}/{event.max_players}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-display text-2xl text-primary leading-none text-glow">
            {event.price === 0 ? "FREE" : `$${event.price}`}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono mt-0.5">
            {event.price === 0 ? "Gratis" : "p/p"}
          </div>
        </div>
      </div>
    </Link>
  );
};
