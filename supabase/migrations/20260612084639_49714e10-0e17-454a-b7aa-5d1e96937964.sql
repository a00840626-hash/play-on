
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS municipio text,
  ADD COLUMN IF NOT EXISTS skill_level text,
  ADD COLUMN IF NOT EXISTS availability text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_skill_level_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_skill_level_check
  CHECK (skill_level IS NULL OR skill_level IN ('principiante','intermedio','avanzado'));
