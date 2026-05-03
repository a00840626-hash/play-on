export type EventSport =
  | "futbol"
  | "tenis"
  | "padel"
  | "running"
  | "basketball"
  | "voleibol"
  | "tocho"
  | "americano";
export type EventType = "partido_abierto" | "torneo" | "clinica" | "liga";

export const eventSportLabels: Record<EventSport, string> = {
  futbol: "Fútbol",
  tenis: "Tenis",
  padel: "Pádel",
  running: "Running",
  basketball: "Basketball",
  voleibol: "Voleibol",
  tocho: "Tocho",
  americano: "F. Americano",
};

export const eventTypeLabels: Record<EventType, string> = {
  partido_abierto: "Partido abierto",
  torneo: "Torneo",
  clinica: "Clínica",
  liga: "Liga",
};

export interface PlayOnEvent {
  id: string;
  sport: EventSport;
  type: EventType;
  title: string;
  date: string;
  location: { name: string; lat: number; lng: number; colonia: string };
  price: number;
  organizer: string;
  current_players: number;
  max_players: number;
  description: string;
}

export const events: PlayOnEvent[] = [
  {
    id: "e1",
    sport: "futbol",
    type: "partido_abierto",
    title: "Cascarita 7v7 nocturno",
    date: "2026-05-04T20:00:00",
    location: { name: "Fan Soccer", lat: 25.6766, lng: -100.3185, colonia: "Centro" },
    price: 95,
    organizer: "Diego R.",
    current_players: 9,
    max_players: 14,
    description: "Partido amistoso entre semana, nivel intermedio.",
  },
  {
    id: "e2",
    sport: "padel",
    type: "torneo",
    title: "Torneo Relámpago Padel Nation",
    date: "2026-05-09T09:00:00",
    location: { name: "Padel Nation", lat: 25.6500, lng: -100.4000, colonia: "San Pedro" },
    price: 350,
    organizer: "Padel Nation",
    current_players: 12,
    max_players: 16,
    description: "Formato eliminación directa, parejas mixtas.",
  },
  {
    id: "e3",
    sport: "running",
    type: "clinica",
    title: "Clínica de running fondista",
    date: "2026-05-10T07:00:00",
    location: { name: "Parque Fundidora", lat: 25.6786, lng: -100.2841, colonia: "Centro" },
    price: 0,
    organizer: "Run MTY Club",
    current_players: 22,
    max_players: 40,
    description: "Técnica de carrera y ritmo aeróbico para 10K+.",
  },
  {
    id: "e4",
    sport: "tenis",
    type: "clinica",
    title: "Clínica de saque y voleo",
    date: "2026-05-12T18:30:00",
    location: { name: "Sporti Valle Poniente", lat: 25.6450, lng: -100.4400, colonia: "San Pedro" },
    price: 220,
    organizer: "Coach Mariana L.",
    current_players: 4,
    max_players: 8,
    description: "Sesión avanzada de 90 min.",
  },
  {
    id: "e5",
    sport: "basketball",
    type: "partido_abierto",
    title: "Pickup 5v5 nocturno",
    date: "2026-05-13T20:00:00",
    location: { name: "Cancha Tec", lat: 25.6515, lng: -100.2895, colonia: "Tec" },
    price: 60,
    organizer: "Hoop MTY",
    current_players: 7,
    max_players: 10,
    description: "Pickup nivel intermedio, balón oficial.",
  },
  {
    id: "e6",
    sport: "voleibol",
    type: "partido_abierto",
    title: "Voleibol playero mixto",
    date: "2026-05-14T18:00:00",
    location: { name: "Parque Rufino Tamayo", lat: 25.6390, lng: -100.3650, colonia: "Valle" },
    price: 50,
    organizer: "Beach MTY",
    current_players: 6,
    max_players: 12,
    description: "Cancha de arena, formato 6v6.",
  },
  {
    id: "e7",
    sport: "futbol",
    type: "liga",
    title: "Jornada 1 · Liga PlayOn MTY",
    date: "2026-05-15T19:00:00",
    location: { name: "Soccer Centro", lat: 25.6700, lng: -100.3100, colonia: "Centro" },
    price: 0,
    organizer: "PlayOn",
    current_players: 60,
    max_players: 60,
    description: "Arranque oficial de la Liga Primavera 2026.",
  },
  {
    id: "e8",
    sport: "tocho",
    type: "partido_abierto",
    title: "Tocho bandera 7v7",
    date: "2026-05-16T17:00:00",
    location: { name: "Campo Cumbres", lat: 25.7050, lng: -100.4100, colonia: "Cumbres" },
    price: 75,
    organizer: "Flag MTY",
    current_players: 10,
    max_players: 14,
    description: "Tocho bandera, sin contacto.",
  },
  {
    id: "e9",
    sport: "running",
    type: "torneo",
    title: "Carrera 10K Cumbres Trail",
    date: "2026-05-17T06:30:00",
    location: { name: "Parque La Huasteca", lat: 25.6300, lng: -100.4600, colonia: "Cumbres" },
    price: 450,
    organizer: "Trail MTY",
    current_players: 180,
    max_players: 300,
    description: "Carrera de montaña con cronometraje oficial.",
  },
  {
    id: "e10",
    sport: "americano",
    type: "torneo",
    title: "Tazón amateur F. Americano",
    date: "2026-05-23T16:00:00",
    location: { name: "Estadio Tec", lat: 25.6510, lng: -100.2880, colonia: "Tec" },
    price: 200,
    organizer: "MTY Football League",
    current_players: 18,
    max_players: 22,
    description: "Final del torneo amateur, equipo completo.",
  },
  {
    id: "e11",
    sport: "tenis",
    type: "torneo",
    title: "Torneo amateur singles",
    date: "2026-05-24T08:00:00",
    location: { name: "Sporti Valle Poniente", lat: 25.6450, lng: -100.4400, colonia: "San Pedro" },
    price: 280,
    organizer: "Carlos V.",
    current_players: 6,
    max_players: 16,
    description: "Categoría 4.0, premios para top 3.",
  },
  {
    id: "e12",
    sport: "running",
    type: "clinica",
    title: "Track workout · series 400m",
    date: "2026-05-27T19:30:00",
    location: { name: "Pista Tecnológico", lat: 25.6520, lng: -100.2900, colonia: "Tec" },
    price: 0,
    organizer: "Run MTY Club",
    current_players: 14,
    max_players: 30,
    description: "Sesión de velocidad guiada por coach.",
  },
];

export const sportEmoji: Record<EventSport, string> = {
  futbol: "⚽",
  tenis: "🎾",
  padel: "🥎",
  running: "🏃",
  basketball: "🏀",
  voleibol: "🏐",
  tocho: "🏈",
  americano: "🏈",
};

export const sportColor: Record<EventSport, string> = {
  futbol: "hsl(var(--primary))",
  tenis: "hsl(212, 100%, 62%)",
  padel: "hsl(49, 100%, 50%)",
  running: "hsl(330, 90%, 60%)",
  basketball: "hsl(20, 100%, 55%)",
  voleibol: "hsl(280, 80%, 65%)",
  tocho: "hsl(160, 80%, 50%)",
  americano: "hsl(0, 80%, 60%)",
};
