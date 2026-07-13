// Caché en memoria del flag onboarded para evitar la carrera entre el
// upsert final del onboarding y la re-consulta de RequireAuth al navegar.
// onboarded nunca regresa a false dentro de una sesión, así que es seguro cachearlo.

const cache = new Map<string, boolean>();

export const markOnboarded = (userId: string) => cache.set(userId, true);
export const isOnboardedCached = (userId: string) => cache.get(userId) === true;
