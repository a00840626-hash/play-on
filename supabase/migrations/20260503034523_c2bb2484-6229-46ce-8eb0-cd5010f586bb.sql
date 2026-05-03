
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Jugador',
  colonia TEXT,
  distance_km NUMERIC,
  sports TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 4.5,
  avatar_url TEXT,
  online BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CONNECTIONS
CREATE TYPE public.connection_status AS ENUM ('pending','accepted','rejected');
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.connection_status NOT NULL DEFAULT 'pending',
  requested_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT diff_users CHECK (user_a <> user_b),
  CONSTRAINT ordered_users CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants view connection" ON public.connections FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "create connection requests" ON public.connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = requested_by AND (auth.uid() = user_a OR auth.uid() = user_b));
CREATE POLICY "participants update connection" ON public.connections FOR UPDATE TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_connection_participant(_conn UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.connections WHERE id = _conn AND status = 'accepted' AND (user_a = _user OR user_b = _user));
$$;

CREATE POLICY "participants view messages" ON public.messages FOR SELECT TO authenticated USING (public.is_connection_participant(connection_id, auth.uid()));
CREATE POLICY "participants send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND public.is_connection_participant(connection_id, auth.uid()));
CREATE POLICY "participants mark read" ON public.messages FOR UPDATE TO authenticated USING (public.is_connection_participant(connection_id, auth.uid()));

-- BADGES
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ,
  UNIQUE (user_id, badge_key)
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges viewable by authenticated" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "users insert own badges" ON public.badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.connections REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;

-- Indexes
CREATE INDEX idx_messages_conn ON public.messages(connection_id, sent_at DESC);
CREATE INDEX idx_connections_users ON public.connections(user_a, user_b);
