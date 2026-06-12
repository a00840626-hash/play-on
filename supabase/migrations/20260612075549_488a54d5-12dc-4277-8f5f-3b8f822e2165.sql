
UPDATE public.demo_players SET colonia = CASE colonia
  WHEN 'Centro' THEN 'Monterrey'
  WHEN 'Cumbres' THEN 'Monterrey'
  WHEN 'San Jerónimo' THEN 'Monterrey'
  WHEN 'San Pedro' THEN 'San Pedro Garza García'
  WHEN 'Valle' THEN 'San Pedro Garza García'
  ELSE colonia
END;
