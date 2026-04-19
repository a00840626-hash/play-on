import courtFanSoccer from "@/assets/court-fan-soccer.jpg";
import courtSoccerCentro from "@/assets/court-soccer-centro.jpg";
import courtPadelNation from "@/assets/court-padel-nation.jpg";
import courtSoccerClub7 from "@/assets/court-soccer-club7.jpg";
import courtSportiValle from "@/assets/court-sporti-valle.jpg";

export type Sport = "futbol" | "tenis" | "padel";
export type SkillLevel = "principiante" | "intermedio" | "avanzado";

export const sportLabels: Record<Sport, string> = {
  futbol: "Fútbol",
  tenis: "Tenis",
  padel: "Pádel",
};

export interface Court {
  id: string;
  name: string;
  sport: Sport;
  neighborhood: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  image: string;
  amenities: string[];
  slots: { time: string; available: boolean }[];
}

export interface OpenMatch {
  id: string;
  sport: Sport;
  courtId: string;
  courtName: string;
  date: string;       // human label "Hoy" / "Mañana" / "Sábado"
  time: string;       // "18:00"
  current: number;
  max: number;
  skill: SkillLevel;
  pricePerPlayer: number;
  hostName: string;
  hostRating: number;
}

export interface League {
  id: string;
  name: string;
  sport: Sport;
  format: string;
  teams: number;
  maxTeams: number;
  prize: string;
}

const standardSlots = [
  { time: "16:00", available: true },
  { time: "17:00", available: false },
  { time: "18:00", available: true },
  { time: "19:00", available: true },
  { time: "20:00", available: false },
  { time: "21:00", available: true },
  { time: "22:00", available: true },
];

export const courts: Court[] = [
  {
    id: "fan-soccer",
    name: "Fan Soccer",
    sport: "futbol",
    neighborhood: "Centro",
    address: "Av. Bernardo Reyes 2310",
    distanceKm: 2.4,
    rating: 4.8,
    reviewCount: 142,
    pricePerHour: 650,
    image: courtFanSoccer,
    amenities: ["Estacionamiento", "Regaderas", "Iluminación", "Cafetería"],
    slots: standardSlots,
  },
  {
    id: "soccer-centro",
    name: "Soccer Centro",
    sport: "futbol",
    neighborhood: "Centro",
    address: "Félix U. Gómez 1102",
    distanceKm: 3.1,
    rating: 4.6,
    reviewCount: 88,
    pricePerHour: 550,
    image: courtSoccerCentro,
    amenities: ["Techado", "Regaderas", "Iluminación"],
    slots: standardSlots,
  },
  {
    id: "padel-nation",
    name: "Padel Nation",
    sport: "padel",
    neighborhood: "San Pedro",
    address: "Calzada del Valle 400",
    distanceKm: 6.8,
    rating: 4.9,
    reviewCount: 210,
    pricePerHour: 480,
    image: courtPadelNation,
    amenities: ["Estacionamiento", "Pro Shop", "Regaderas", "Cafetería"],
    slots: standardSlots,
  },
  {
    id: "soccer-club-7",
    name: "Soccer Club 7",
    sport: "futbol",
    neighborhood: "Agrícola Acero",
    address: "Av. Acero 880",
    distanceKm: 4.2,
    rating: 4.5,
    reviewCount: 64,
    pricePerHour: 600,
    image: courtSoccerClub7,
    amenities: ["Estacionamiento", "Iluminación"],
    slots: standardSlots,
  },
  {
    id: "sporti-valle",
    name: "Sporti Valle Poniente",
    sport: "futbol",
    neighborhood: "San Pedro",
    address: "Av. Valle Poniente 1500",
    distanceKm: 8.0,
    rating: 4.7,
    reviewCount: 175,
    pricePerHour: 720,
    image: courtSportiValle,
    amenities: ["Estacionamiento", "Regaderas", "Iluminación", "Gradas"],
    slots: standardSlots,
  },
];

export const openMatches: OpenMatch[] = [
  {
    id: "m1",
    sport: "futbol",
    courtId: "fan-soccer",
    courtName: "Fan Soccer",
    date: "Mañana",
    time: "18:00",
    current: 4,
    max: 7,
    skill: "intermedio",
    pricePerPlayer: 95,
    hostName: "Diego R.",
    hostRating: 4.7,
  },
  {
    id: "m2",
    sport: "padel",
    courtId: "padel-nation",
    courtName: "Padel Nation",
    date: "Hoy",
    time: "19:30",
    current: 2,
    max: 4,
    skill: "intermedio",
    pricePerPlayer: 130,
    hostName: "Ana M.",
    hostRating: 4.9,
  },
  {
    id: "m3",
    sport: "tenis",
    courtId: "padel-nation",
    courtName: "Padel Nation",
    date: "Sábado",
    time: "10:00",
    current: 1,
    max: 4,
    skill: "avanzado",
    pricePerPlayer: 180,
    hostName: "Carlos V.",
    hostRating: 4.8,
  },
];

export const leagues: League[] = [
  {
    id: "l1",
    name: "Liga PlayOn MTY Primavera 2026",
    sport: "futbol",
    format: "Fútbol 5v5",
    teams: 6,
    maxTeams: 8,
    prize: "$15,000 + Trofeo",
  },
];

export const currentUser = {
  name: "Alejandro Ruiz",
  level: "Intermedio",
  matchesPlayed: 47,
  winRate: 62,
  hoursPlayed: 132,
  sports: [
    { sport: "futbol" as Sport, skill: "intermedio" as SkillLevel },
    { sport: "padel" as Sport, skill: "principiante" as SkillLevel },
  ],
  achievements: [
    { title: "Primer partido", desc: "Jugaste tu primer partido en PlayOn" },
    { title: "Racha de 5", desc: "Ganaste 5 partidos seguidos" },
    { title: "Anfitrión MVP", desc: "Organizaste 10 partidos abiertos" },
  ],
};
