import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { PlayOnEvent, eventSportLabels, eventTypeLabels, sportEmoji, sportColor } from "@/data/events";

export const EventCard = ({ event, compact }: { event: PlayOnEvent; compact?: boolean }) => {
  const d = new Date(event.date);
  const dateLabel = d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
  const timeLabel = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const accent = sportColor[event.sport];

  return (
    <Link
      to="#"
      className={`block rounded border border-border bg-card hover:border-primary/50 transition-colors ${
        compact ? "w-72 flex-shrink-0" : ""
      }`}
    >
      <div className="flex gap-3 p-3">
        <div
          className="relative h-20 w-20 flex-shrink-0 rounded-sm flex items-center justify-center text-3xl"
          style={{
            background: `linear-gradient(135deg, ${accent}33, ${accent}10)`,
            border: `1px solid ${accent}55`,
          }}
        >
          <span>{sportEmoji[event.sport]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest font-mono"
              style={{ color: accent, border: `1px solid ${accent}66`, background: `${accent}14` }}
            >
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
