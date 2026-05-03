import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { events, EventSport, eventSportLabels, PlayOnEvent } from "@/data/events";
import { EventCard } from "./EventCard";

type View = "calendario" | "lista" | "mapa";
type SportFilter = "all" | EventSport;

const sportFilters: { id: SportFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "futbol", label: "Fútbol" },
  { id: "tenis", label: "Tenis" },
  { id: "padel", label: "Pádel" },
  { id: "running", label: "Running" },
];

const monthLabels = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const EventosHub = () => {
  const [view, setView] = useState<View>("calendario");
  const [sport, setSport] = useState<SportFilter>("all");
  const [cursor, setCursor] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(4);
  const [activeEventId, setActiveEventId] = useState<string>(events[0].id);

  const filtered = useMemo(
    () => (sport === "all" ? events : events.filter((e) => e.sport === sport)),
    [sport]
  );

  return (
    <div className="px-4 mt-5">
      {/* View toggle */}
      <div className="flex gap-1 p-1 rounded-full border border-border bg-card">
        {(["calendario", "lista", "mapa"] as View[]).map((v) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 h-9 rounded-full text-[11px] font-bold uppercase tracking-widest font-mono transition-all ${
                active
                  ? "bg-primary text-primary-foreground glow-green"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          );
        })}
      </div>

      {/* Sport filters */}
      <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {sportFilters.map((f) => {
          const active = sport === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSport(f.id)}
              className={`flex-shrink-0 h-8 px-3 rounded-sm border text-[10px] font-bold uppercase tracking-widest font-mono transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary glow-green"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {view === "calendario" && (
          <CalendarView
            cursor={cursor}
            setCursor={setCursor}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            events={filtered}
          />
        )}
        {view === "lista" && <ListView events={filtered} cursor={cursor} />}
        {view === "mapa" && (
          <MapView
            events={filtered}
            activeEventId={activeEventId}
            setActiveEventId={setActiveEventId}
          />
        )}
      </div>
    </div>
  );
};

const CalendarView = ({
  cursor,
  setCursor,
  selectedDay,
  setSelectedDay,
  events,
}: {
  cursor: Date;
  setCursor: (d: Date) => void;
  selectedDay: number | null;
  setSelectedDay: (d: number | null) => void;
  events: PlayOnEvent[];
}) => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = new Date();
  const todayMatches = today.getMonth() === month && today.getFullYear() === year;

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = useMemo(() => {
    const map: Record<number, PlayOnEvent[]> = {};
    for (const e of events) {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        (map[day] = map[day] || []).push(e);
      }
    }
    return map;
  }, [events, month, year]);

  const dayEvents = selectedDay ? eventsByDay[selectedDay] || [] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="h-9 w-9 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40"
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="font-display text-3xl leading-none">
          {monthLabels[month]} <span className="text-primary">{year}</span>
        </h2>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="h-9 w-9 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] uppercase tracking-widest font-mono text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const isToday = todayMatches && today.getDate() === d;
          const isSelected = selectedDay === d;
          const dayEvts = eventsByDay[d] || [];
          const dotCount = Math.min(dayEvts.length, 3);

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(d)}
              className={`aspect-square rounded-sm flex flex-col items-center justify-center relative text-sm font-mono transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground font-bold"
                  : isToday
                  ? "border border-primary text-primary bg-card"
                  : "bg-card text-foreground hover:border-primary/40 border border-transparent"
              }`}
            >
              <span>{d}</span>
              {dotCount > 0 && !isSelected && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {Array.from({ length: dotCount }).map((_, idx) => (
                    <div key={idx} className="h-1 w-1 rounded-full bg-primary" />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <h3 className="font-condensed uppercase tracking-widest text-xs text-muted-foreground mb-2">
          // Eventos del {selectedDay ?? "—"} {monthLabels[month].toLowerCase()}
        </h3>
        <div className="space-y-2">
          {dayEvents.length > 0 ? (
            dayEvents.map((e) => <EventCard key={e.id} event={e} />)
          ) : (
            <div className="rounded border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
              Sin eventos este día.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ListView = ({ events, cursor }: { events: PlayOnEvent[]; cursor: Date }) => {
  const groups = useMemo(() => {
    const month = cursor.getMonth();
    const year = cursor.getFullYear();
    const inMonth = events.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const byWeek: Record<number, PlayOnEvent[]> = {};
    for (const e of inMonth) {
      const d = new Date(e.date);
      const week = Math.ceil((d.getDate() + ((new Date(year, month, 1).getDay() + 6) % 7)) / 7);
      (byWeek[week] = byWeek[week] || []).push(e);
    }
    return Object.entries(byWeek)
      .map(([w, evts]) => ({ week: Number(w), events: evts.sort((a, b) => a.date.localeCompare(b.date)) }))
      .sort((a, b) => a.week - b.week);
  }, [events, cursor]);

  const month = cursor.getMonth();
  const year = cursor.getFullYear();

  const weekRange = (week: number) => {
    const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const start = (week - 1) * 7 - firstOffset + 1;
    const end = start + 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const s = Math.max(1, start);
    const e = Math.min(daysInMonth, end);
    return `${String(s).padStart(2, "0")} — ${String(e).padStart(2, "0")} ${monthLabels[month]}`;
  };

  return (
    <div className="space-y-5">
      {groups.length === 0 && (
        <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Sin eventos este mes.
        </div>
      )}
      {groups.map((g) => (
        <div key={g.week}>
          <div className="sticky top-0 z-10 bg-background py-2">
            <h3 className="font-condensed uppercase tracking-widest text-xs text-muted-foreground">
              // SEMANA {g.week} · {weekRange(g.week)}
            </h3>
          </div>
          <div className="space-y-2">
            {g.events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const MapView = ({
  events,
  activeEventId,
  setActiveEventId,
}: {
  events: PlayOnEvent[];
  activeEventId: string;
  setActiveEventId: (id: string) => void;
}) => {
  // Project lat/lng to a normalized 0-1 box for our fake map
  const lats = events.map((e) => e.location.lat);
  const lngs = events.map((e) => e.location.lng);
  const minLat = Math.min(...lats) - 0.01;
  const maxLat = Math.max(...lats) + 0.01;
  const minLng = Math.min(...lngs) - 0.01;
  const maxLng = Math.max(...lngs) + 0.01;

  const project = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * 100,
    y: 100 - ((lat - minLat) / (maxLat - minLat)) * 100,
  });

  const active = events.find((e) => e.id === activeEventId) || events[0];

  return (
    <div>
      <div className="relative h-[320px] rounded border border-border bg-card field-grid overflow-hidden">
        {/* Fake map streets */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-0 right-0 top-1/3 h-px bg-primary/20" />
          <div className="absolute left-0 right-0 top-2/3 h-px bg-primary/20" />
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-primary/20" />
          <div className="absolute top-0 bottom-0 left-2/3 w-px bg-primary/20" />
        </div>

        {events.map((e) => {
          const { x, y } = project(e.location.lat, e.location.lng);
          const isActive = e.id === activeEventId;
          return (
            <button
              key={e.id}
              onClick={() => setActiveEventId(e.id)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground glow-green-strong scale-125 z-10"
                  : "bg-primary/80 text-primary-foreground hover:scale-110"
              }`}
            >
              <MapPin size={14} fill="currentColor" />
            </button>
          );
        })}

        {/* Bottom sheet for active pin */}
        {active && (
          <div className="absolute left-2 right-2 bottom-2">
            <EventCard event={active} />
          </div>
        )}
      </div>

      <h3 className="font-condensed uppercase tracking-widest text-xs text-muted-foreground mt-4 mb-2">
        // Todos los eventos
      </h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {events.map((e) => (
          <div key={e.id} onClick={() => setActiveEventId(e.id)} className="cursor-pointer">
            <EventCard event={e} compact />
          </div>
        ))}
      </div>
    </div>
  );
};
