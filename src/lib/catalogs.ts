// Catálogos compartidos entre Onboarding, ProfileEdit y vistas de perfil.
// Los ids son los valores que se guardan en la BD; no cambiarlos sin migrar datos.

export const MUNICIPIOS = [
  "Monterrey", "Guadalupe", "Apodaca", "Escobedo", "San Nicolás",
  "Santa Catarina", "García", "Juárez", "San Pedro", "Cadereyta",
  "Salinas Victoria", "Santiago",
] as const;

export const SPORTS: { id: string; label: string; icon: string }[] = [
  { id: "futbol", label: "Fútbol", icon: "⚽" },
  { id: "padel", label: "Pádel", icon: "🎾" },
  { id: "tenis", label: "Tenis", icon: "🎾" },
  { id: "basquetbol", label: "Básquet", icon: "🏀" },
  { id: "voleibol", label: "Voleibol", icon: "🏐" },
  { id: "pickleball", label: "Pickleball", icon: "🥒" },
  { id: "running", label: "Running", icon: "🏃" },
];

// Ids guardados por versiones anteriores del onboarding → id canónico
const LEGACY_SPORT_IDS: Record<string, string> = {
  basket: "basquetbol",
  volley: "voleibol",
};

export const canonicalSportId = (id: string) => LEGACY_SPORT_IDS[id] ?? id;

export const sportLabel = (id: string) => {
  const canonical = canonicalSportId(id);
  return SPORTS.find((s) => s.id === canonical)?.label ?? id;
};

export const sportIcon = (id: string) => {
  const canonical = canonicalSportId(id);
  return SPORTS.find((s) => s.id === canonical)?.icon ?? "•";
};

export const LEVELS = [
  { id: "principiante", label: "Principiante" },
  { id: "intermedio", label: "Intermedio" },
  { id: "avanzado", label: "Avanzado" },
] as const;

export const LEVEL_LABEL: Record<string, string> = Object.fromEntries(
  LEVELS.map((l) => [l.id, l.label]),
);

export const DAYS = [
  { id: "lun", label: "Lun" },
  { id: "mar", label: "Mar" },
  { id: "mie", label: "Mié" },
  { id: "jue", label: "Jue" },
  { id: "vie", label: "Vie" },
  { id: "sab", label: "Sáb" },
  { id: "dom", label: "Dom" },
];
