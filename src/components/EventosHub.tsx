import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { events, EventSport, eventSportLabels, PlayOnEvent, sportColor, sportEmoji } from "@/data/events";
import { EventCard } from "./EventCard";

type View = "calendario" | "lista" | "mapa";

const allSports: EventSport[] = [
  "futbol",
  "tenis",
  "padel",
  "running",
  "basketball",
  "voleibol",
  "tocho",
  "americano",
];

const monthLabels = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const EventosHub = () => {
  const [view, setView] = useState<View>("calendario");
  const [selectedSports, setSelectedSports] = useState<Set<EventSport>>(new Set());
  const [cursor, setCursor] = useState(new Date(2026, 4, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(4);

  const toggleSport = (s: EventSport) => {
    const next = new Set(selectedSports);
    next.has(s) ? next.delete(s) : next.add(s);
    setSelectedSports(next);
  };

  const filtered = useMemo(
    () => (selectedSports.size === 0 ? events : events.filter((e) => selectedSports.has(e.sport))),
    [selectedSports]
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

      {/* Multi-select sport filters */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setSelectedSports(new Set())}
          className={`flex-shrink-0 h-8 px-3 rounded-sm border text-[10px] font-bold uppercase tracking-widest font-mono transition-all ${
            selectedSports.size === 0
              ? "bg-primary text-primary-foreground border-primary glow-green"
              : "bg-card text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          Todos
        </button>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {allSports.map((s) => {
            const active = selectedSports.has(s);
            const color = sportColor[s];
            return (
              <button
                key={s}
                onClick={() => toggleSport(s)}
                style={
                  active
                    ? { background: color, borderColor: color, color: "hsl(var(--background))" }
                    : { borderColor: `${color}55`, color }
                }
                className="flex-shrink-0 h-8 px-3 rounded-sm border bg-card text-[10px] font-bold uppercase tracking-widest font-mono transition-all flex items-center gap-1"
              >
                <span>{sportEmoji[s]}</span>
                {eventSportLabels[s]}
              </button>
            );
          })}
        </div>
      </div>
      {selectedSports.size > 0 && (
        <p className="mt-2 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          // {selectedSports.size} deporte{selectedSports.size > 1 ? "s" : ""} ·{" "}
          {filtered.length} evento{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

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
        {view === "mapa" && <MapView events={filtered} />}
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
  const startOffset = (firstDay.getDay() + 6) % 7;
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
              {dotCount > 0 && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {dayEvts.slice(0, 3).map((e, idx) => (
                    <div
                      key={idx}
                      className="h-1 w-1 rounded-full"
                      style={{
                        background: isSelected ? "hsl(var(--primary-foreground))" : sportColor[e.sport],
                      }}
                    />
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

const makeIcon = (sport: EventSport) => {
  const color = sportColor[sport];
  const emoji = sportEmoji[sport];
  return L.divIcon({
    className: "playon-marker",
    html: `<div style="
      background:${color};
      width:34px;height:34px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 12px ${color}99, 0 2px 6px rgba(0,0,0,.5);
      border:2px solid hsl(var(--background));
    ">
      <span style="transform:rotate(45deg);font-size:16px;line-height:1;">${emoji}</span>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

const MapView = ({ events }: { events: PlayOnEvent[] }) => {
  const [activeId, setActiveId] = useState<string | null>(events[0]?.id ?? null);

  useEffect(() => {
    if (!events.find((e) => e.id === activeId)) {
      setActiveId(events[0]?.id ?? null);
    }
  }, [events, activeId]);

  const center: [number, number] = events.length
    ? [
        events.reduce((s, e) => s + e.location.lat, 0) / events.length,
        events.reduce((s, e) => s + e.location.lng, 0) / events.length,
      ]
    : [25.6714, -100.3094];

  const active = events.find((e) => e.id === activeId);

  if (events.length === 0) {
    return (
      <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Sin eventos para mostrar en el mapa.
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[420px] rounded border border-border overflow-hidden">
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", background: "hsl(var(--card))" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap, &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {events.map((e) => (
            <Marker
              key={e.id}
              position={[e.location.lat, e.location.lng]}
              icon={makeIcon(e.sport)}
              eventHandlers={{ click: () => setActiveId(e.id) }}
            >
              <Popup>
                <strong>{e.title}</strong>
                <br />
                {e.location.name}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {active && (
          <div className="absolute left-2 right-2 bottom-2 z-[500]">
            <div className="relative">
              <button
                onClick={() => setActiveId(null)}
                className="absolute -top-2 -right-2 z-10 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary"
                aria-label="Cerrar"
              >
                <X size={14} />
              </button>
              <EventCard event={active} />
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-widest font-mono text-muted-foreground text-center">
        // {events.length} eventos en el mapa · toca un pin para ver detalle
      </p>
    </div>
  );
};
