
-- Seed table of mock discoverable players (read-only public catalog)
CREATE TABLE public.demo_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  colonia TEXT NOT NULL,
  distance_km NUMERIC NOT NULL,
  sports TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC NOT NULL DEFAULT 4.5,
  avatar_seed TEXT NOT NULL,
  bio TEXT,
  online BOOLEAN DEFAULT false
);
ALTER TABLE public.demo_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo players readable" ON public.demo_players FOR SELECT TO authenticated USING (true);

-- Per-user connection with each demo player
CREATE TYPE public.demo_conn_status AS ENUM ('none','pending','accepted');
CREATE TABLE public.demo_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  demo_player_id UUID NOT NULL REFERENCES public.demo_players(id) ON DELETE CASCADE,
  status public.demo_conn_status NOT NULL DEFAULT 'pending',
  last_played TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, demo_player_id)
);
ALTER TABLE public.demo_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own demo connections select" ON public.demo_connections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own demo connections insert" ON public.demo_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own demo connections update" ON public.demo_connections FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Chat messages between user and demo player
CREATE TABLE public.demo_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.demo_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('me','them')),
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
ALTER TABLE public.demo_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own demo messages select" ON public.demo_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own demo messages insert" ON public.demo_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own demo messages update" ON public.demo_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Realtime
ALTER TABLE public.demo_messages REPLICA IDENTITY FULL;
ALTER TABLE public.demo_connections REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_connections;

CREATE INDEX idx_demo_messages_conn ON public.demo_messages(connection_id, sent_at);
CREATE INDEX idx_demo_connections_user ON public.demo_connections(user_id);

-- Seed 8 demo players
INSERT INTO public.demo_players (display_name, colonia, distance_km, sports, rating, avatar_seed, bio, online) VALUES
('Diego R.',   'Centro',           2.4, ARRAY['futbol','tocho'],     4.8, 'diego', 'Mediocampista, 5v5',           true),
('Ana M.',     'San Pedro',        3.1, ARRAY['padel','tenis'],      4.9, 'ana',   'Padel viernes/sábado',          true),
('Carlos V.',  'Cumbres',          1.8, ARRAY['futbol','running'],   4.7, 'carlos','Defensa, busco partido',        false),
('Mariana L.', 'Valle',            4.2, ARRAY['voleibol','padel'],   4.6, 'mariana','Líbero, equipo mixto',         true),
('Jorge T.',   'San Jerónimo',     5.0, ARRAY['basketball'],         4.5, 'jorge', 'Escolta, pickup games',         false),
('Paola S.',   'Centro',           2.9, ARRAY['running','futbol'],   4.8, 'paola', 'Trail + 5v5',                   true),
('Iván H.',    'Cumbres',          1.2, ARRAY['americano','tocho'],  4.4, 'ivan',  'Tackle, busco práctica',        false),
('Renata G.',  'San Pedro',        6.5, ARRAY['tenis'],              4.9, 'renata','Singles avanzado',              true);
