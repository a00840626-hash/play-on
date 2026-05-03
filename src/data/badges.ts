import { Trophy, Flame, Target, Users, Goal, Sunrise, Moon, Crown, Medal, Sparkles } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface BadgeDef {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  earnedAt?: string; // ISO date
  locked?: boolean;
}

export const badgeCatalog: BadgeDef[] = [
  { key: "primera_cancha", title: "PRIMERA CANCHA", description: "Reservaste tu primera cancha.", icon: Medal, earnedAt: "2026-04-12" },
  { key: "10_partidos",   title: "10 PARTIDOS",     description: "Jugaste 10 partidos en PlayOn.", icon: Trophy, earnedAt: "2026-04-22" },
  { key: "racha_semanal", title: "RACHA SEMANAL",   description: "7 días seguidos jugando.",      icon: Flame,  earnedAt: "2026-04-28" },
  { key: "goleador",      title: "GOLEADOR",        description: "5+ goles en un partido.",        icon: Goal,   earnedAt: "2026-04-19" },
  { key: "conector",      title: "CONECTOR",        description: "10 conexiones nuevas.",          icon: Users,  locked: true },
  { key: "liga_champion", title: "LIGA CHAMPION",   description: "Ganaste una liga.",              icon: Crown,  locked: true },
  { key: "multi_deporte", title: "MULTI-DEPORTE",   description: "Practicaste 3+ deportes.",       icon: Sparkles, earnedAt: "2026-04-30" },
  { key: "madrugador",    title: "MADRUGADOR",      description: "Jugaste antes de las 7am.",      icon: Sunrise, locked: true },
  { key: "nocturno",      title: "NOCTURNO",        description: "Jugaste después de las 10pm.",   icon: Moon,    earnedAt: "2026-04-15" },
  { key: "anfitrion",     title: "ANFITRIÓN",       description: "Organizaste 5+ partidos.",       icon: Target,  locked: true },
];

export const fmtBadgeDate = (iso: string) => {
  const d = new Date(iso);
  const months = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  return `${String(d.getDate()).padStart(2,"0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
