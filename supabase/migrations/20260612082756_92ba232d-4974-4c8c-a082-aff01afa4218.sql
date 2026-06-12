
ALTER TABLE public.demo_players
  ADD COLUMN IF NOT EXISTS skill_level text,
  ADD COLUMN IF NOT EXISTS availability text[];

UPDATE public.demo_players SET
  skill_level = CASE (abs(hashtext(id::text)) % 3)
    WHEN 0 THEN 'principiante'
    WHEN 1 THEN 'intermedio'
    ELSE 'avanzado'
  END,
  availability = CASE (abs(hashtext(id::text)) % 6)
    WHEN 0 THEN ARRAY['sab','dom']
    WHEN 1 THEN ARRAY['lun','mie','vie']
    WHEN 2 THEN ARRAY['mar','jue']
    WHEN 3 THEN ARRAY['vie','sab','dom']
    WHEN 4 THEN ARRAY['lun','mar','mie','jue','vie']
    ELSE ARRAY['mie','sab']
  END
WHERE skill_level IS NULL OR availability IS NULL;
