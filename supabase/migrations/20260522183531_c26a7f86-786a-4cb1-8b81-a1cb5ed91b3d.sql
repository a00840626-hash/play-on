
CREATE TABLE public.signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert signup"
ON public.signups FOR INSERT
TO anon, authenticated
WITH CHECK (true);
