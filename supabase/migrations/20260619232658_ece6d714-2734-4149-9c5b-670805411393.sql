
-- MATCHES
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport text NOT NULL,
  title text NOT NULL,
  court_id uuid,
  location text,
  starts_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  max_players int NOT NULL DEFAULT 4,
  skill_level text,
  price_per_player numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read matches" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "host insert matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "host update matches" ON public.matches FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "host delete matches" ON public.matches FOR DELETE TO authenticated USING (auth.uid() = host_id);

-- MATCH PARTICIPANTS
CREATE TABLE public.match_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'joined',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_participants TO authenticated;
GRANT ALL ON public.match_participants TO service_role;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read participants" ON public.match_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "self join" ON public.match_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "self leave" ON public.match_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- COURTS
CREATE TABLE public.courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  sport text NOT NULL,
  address text NOT NULL,
  municipio text,
  lat numeric(10,7),
  lng numeric(10,7),
  price_per_hour numeric(10,2) NOT NULL DEFAULT 0,
  amenities text[] NOT NULL DEFAULT '{}',
  image_url text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courts TO authenticated;
GRANT SELECT ON public.courts TO anon;
GRANT ALL ON public.courts TO service_role;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read courts" ON public.courts FOR SELECT USING (true);
CREATE POLICY "owner insert courts" ON public.courts FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner update courts" ON public.courts FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "owner delete courts" ON public.courts FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- BOOKINGS
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'on_site',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM public.courts WHERE id = court_id));
CREATE POLICY "user creates booking" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user or owner updates booking" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM public.courts WHERE id = court_id));
CREATE POLICY "user or owner deletes booking" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM public.courts WHERE id = court_id));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "system or self insert notif" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR true);
CREATE POLICY "user updates own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user deletes own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- TRIGGER updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_matches_updated BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_courts_updated BEFORE UPDATE ON public.courts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Notify host when someone joins their match
CREATE OR REPLACE FUNCTION public.notify_match_join()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _host uuid; _title text; _name text;
BEGIN
  SELECT host_id, title INTO _host, _title FROM public.matches WHERE id = NEW.match_id;
  IF _host IS NOT NULL AND _host <> NEW.user_id THEN
    SELECT display_name INTO _name FROM public.profiles WHERE id = NEW.user_id;
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (_host, 'match_join', 'Nuevo jugador en tu partido', COALESCE(_name,'Alguien') || ' se unió a ' || _title, '/matches/' || NEW.match_id);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_notify_match_join AFTER INSERT ON public.match_participants FOR EACH ROW EXECUTE FUNCTION public.notify_match_join();

-- Notify owner when booking created
CREATE OR REPLACE FUNCTION public.notify_booking_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid; _cname text;
BEGIN
  SELECT owner_id, name INTO _owner, _cname FROM public.courts WHERE id = NEW.court_id;
  IF _owner IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (_owner, 'booking_new', 'Nueva reserva', 'Reserva pendiente en ' || _cname, '/owner');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_notify_booking AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.notify_booking_created();

-- Seed 5 courts (no owner)
INSERT INTO public.courts (name, sport, address, municipio, price_per_hour, amenities, description) VALUES
  ('Cancha Padel San Pedro', 'padel', 'Av. Vasconcelos 1500, San Pedro Garza García', 'San Pedro', 350, ARRAY['Estacionamiento','Vestidores','Iluminación'], 'Cancha de pádel techada de cristal'),
  ('Club Fútbol 7 Cumbres', 'futbol', 'Av. Paseo de los Leones 4500, Cumbres', 'Monterrey', 600, ARRAY['Estacionamiento','Cafetería','Iluminación','Vestidores'], 'Cancha de fútbol 7 con pasto sintético'),
  ('Tenis Valle Oriente', 'tenis', 'Av. Lázaro Cárdenas 2400, Valle Oriente', 'San Pedro', 280, ARRAY['Estacionamiento','Iluminación','Pro shop'], 'Canchas de tenis de arcilla'),
  ('Básquet Tec Monterrey', 'basquetbol', 'Av. Eugenio Garza Sada 2501, Monterrey', 'Monterrey', 200, ARRAY['Vestidores','Agua'], 'Cancha techada de duela'),
  ('Pickleball Carrizalejo', 'pickleball', 'Calz. del Valle 333, San Pedro', 'San Pedro', 250, ARRAY['Estacionamiento','Iluminación'], 'Cuatro canchas oficiales de pickleball');
