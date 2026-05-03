export type EventSport = "futbol" | "tenis" | "padel" | "running";
export type EventType = "partido_abierto" | "torneo" | "clinica" | "liga";

export const eventSportLabels: Record<EventSport, string> = {
  futbol: "Fútbol",
  tenis: "Tenis",
  padel: "Pádel",
  running: "Running",
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
  date: string; // ISO datetime
  location: { name: string; lat: number; lng: number; colonia: string };
  price: number;
  organizer: string;
  current_players: number;
  max_players: number;
  image_url: string;
  description: string;
}

// May 2026 mock events
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
    image_url: "/placeholder.svg",
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
    image_url: "/placeholder.svg",
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
    image_url: "/placeholder.svg",
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
    image_url: "/placeholder.svg",
    description: "Sesión avanzada de 90 min.",
  },
  {
    id: "e5",
    sport: "futbol",
    type: "liga",
    title: "Jornada 1 · Liga PlayOn MTY",
    date: "2026-05-15T19:00:00",
    location: { name: "Soccer Centro", lat: 25.6700, lng: -100.3100, colonia: "Centro" },
    price: 0,
    organizer: "PlayOn",
    current_players: 60,
    max_players: 60,
    image_url: "/placeholder.svg",
    description: "Arranque oficial de la Liga Primavera 2026.",
  },
  {
    id: "e6",
    sport: "padel",
    type: "partido_abierto",
    title: "Pádel mixto sábado AM",
    date: "2026-05-16T10:00:00",
    location: { name: "Padel Nation", lat: 25.6500, lng: -100.4000, colonia: "San Pedro" },
    price: 130,
    organizer: "Ana M.",
    current_players: 2,
    max_players: 4,
    image_url: "/placeholder.svg",
    description: "Buscamos pareja mixta nivel intermedio.",
  },
  {
    id: "e7",
    sport: "running",
    type: "torneo",
    title: "Carrera 10K Cumbres Trail",
    date: "2026-05-17T06:30:00",
    location: { name: "Parque La Huasteca", lat: 25.6300, lng: -100.4600, colonia: "Cumbres" },
    price: 450,
    organizer: "Trail MTY",
    current_players: 180,
    max_players: 300,
    image_url: "/placeholder.svg",
    description: "Carrera de montaña con cronometraje oficial.",
  },
  {
    id: "e8",
    sport: "futbol",
    type: "partido_abierto",
    title: "Fútbol 5 nivel principiante",
    date: "2026-05-21T21:00:00",
    location: { name: "Soccer Club 7", lat: 25.6650, lng: -100.3500, colonia: "Agrícola Acero" },
    price: 80,
    organizer: "Jorge T.",
    current_players: 5,
    max_players: 10,
    image_url: "/placeholder.svg",
    description: "Para los que están empezando, ambiente relajado.",
  },
  {
    id: "e9",
    sport: "tenis",
    type: "torneo",
    title: "Torneo amateur singles",
    date: "2026-05-24T08:00:00",
    location: { name: "Sporti Valle Poniente", lat: 25.6450, lng: -100.4400, colonia: "San Pedro" },
    price: 280,
    organizer: "Carlos V.",
    current_players: 6,
    max_players: 16,
    image_url: "/placeholder.svg",
    description: "Categoría 4.0, premios para top 3.",
  },
  {
    id: "e10",
    sport: "running",
    type: "clinica",
    title: "Track workout · series 400m",
    date: "2026-05-27T19:30:00",
    location: { name: "Pista Tecnológico", lat: 25.6520, lng: -100.2900, colonia: "Tec" },
    price: 0,
    organizer: "Run MTY Club",
    current_players: 14,
    max_players: 30,
    image_url: "/placeholder.svg",
    description: "Sesión de velocidad guiada por coach.",
  },
];
