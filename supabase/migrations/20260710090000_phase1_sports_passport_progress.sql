-- Phase 1 Sports Passport progression.
-- Reversible rollback outline:
--   DROP TRIGGER IF EXISTS trg_xp_match_hosted ON public.matches;
--   DROP TRIGGER IF EXISTS trg_xp_match_completed ON public.matches;
--   DROP TRIGGER IF EXISTS trg_xp_match_joined ON public.match_participants;
--   DROP TRIGGER IF EXISTS trg_xp_connection_accepted ON public.connections;
--   DROP TRIGGER IF EXISTS trg_xp_badge_earned ON public.badges;
--   DROP TRIGGER IF EXISTS trg_sync_user_sport_profiles ON public.profiles;
--   DROP FUNCTION IF EXISTS public.award_badge_xp();
--   DROP FUNCTION IF EXISTS public.award_connection_xp();
--   DROP FUNCTION IF EXISTS public.award_match_completion_xp();
--   DROP FUNCTION IF EXISTS public.award_match_join_xp();
--   DROP FUNCTION IF EXISTS public.award_match_host_xp();
--   DROP FUNCTION IF EXISTS public.award_xp(uuid, text, text, text, uuid, integer, jsonb);
--   DROP FUNCTION IF EXISTS public.sync_user_sport_profiles();
--   DROP FUNCTION IF EXISTS public.xp_level(integer);
--   DROP TABLE IF EXISTS public.xp_events;
--   DROP TABLE IF EXISTS public.user_sport_profiles;
--   DROP TABLE IF EXISTS public.user_progress;

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_xp integer NOT NULL DEFAULT 0 CHECK (overall_xp >= 0),
  overall_level integer NOT NULL DEFAULT 1 CHECK (overall_level >= 1),
  current_streak integer NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak integer NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date date,
  games_played integer NOT NULL DEFAULT 0 CHECK (games_played >= 0),
  sports_friends_made integer NOT NULL DEFAULT 0 CHECK (sports_friends_made >= 0),
  badges_earned integer NOT NULL DEFAULT 0 CHECK (badges_earned >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_sport_profiles (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport text NOT NULL,
  skill_level text,
  xp integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  games_played integer NOT NULL DEFAULT 0 CHECK (games_played >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sport),
  CONSTRAINT user_sport_profiles_skill_level_check
    CHECK (skill_level IS NULL OR skill_level IN ('principiante','intermedio','avanzado'))
);

CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport text,
  event_type text NOT NULL CHECK (event_type IN ('match_joined','match_hosted','match_completed','connection_made','badge_earned')),
  source_table text NOT NULL,
  source_id uuid NOT NULL,
  xp_amount integer NOT NULL CHECK (xp_amount > 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_type, source_table, source_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sport_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users view own progress" ON public.user_progress;
CREATE POLICY "users view own progress"
ON public.user_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users view own sport profiles" ON public.user_sport_profiles;
CREATE POLICY "users view own sport profiles"
ON public.user_sport_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users view own xp events" ON public.xp_events;
CREATE POLICY "users view own xp events"
ON public.xp_events FOR SELECT TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT ON public.user_progress TO authenticated;
GRANT SELECT ON public.user_sport_profiles TO authenticated;
GRANT SELECT ON public.xp_events TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
GRANT ALL ON public.user_sport_profiles TO service_role;
GRANT ALL ON public.xp_events TO service_role;

CREATE INDEX IF NOT EXISTS idx_user_sport_profiles_user ON public.user_sport_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_created ON public.xp_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_source ON public.xp_events(source_table, source_id);

CREATE OR REPLACE FUNCTION public.xp_level(_xp integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT greatest(1, floor(sqrt(greatest(_xp, 0)::numeric / 100))::integer + 1);
$$;

CREATE OR REPLACE FUNCTION public.award_xp(
  _user_id uuid,
  _sport text,
  _event_type text,
  _source_table text,
  _source_id uuid,
  _xp_amount integer,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer;
  prev_date date;
  next_streak integer;
BEGIN
  IF _user_id IS NULL OR _source_id IS NULL OR _xp_amount <= 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.xp_events (user_id, sport, event_type, source_table, source_id, xp_amount, metadata)
  VALUES (_user_id, _sport, _event_type, _source_table, _source_id, _xp_amount, COALESCE(_metadata, '{}'::jsonb))
  ON CONFLICT (user_id, event_type, source_table, source_id) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count = 0 THEN
    RETURN;
  END IF;

  SELECT last_activity_date INTO prev_date
  FROM public.user_progress
  WHERE user_id = _user_id;

  IF prev_date IS NULL THEN
    next_streak := 1;
  ELSIF prev_date = current_date THEN
    SELECT current_streak INTO next_streak FROM public.user_progress WHERE user_id = _user_id;
    next_streak := COALESCE(next_streak, 1);
  ELSIF prev_date = current_date - 1 THEN
    SELECT current_streak + 1 INTO next_streak FROM public.user_progress WHERE user_id = _user_id;
  ELSE
    next_streak := 1;
  END IF;

  INSERT INTO public.user_progress (user_id, overall_xp, overall_level, current_streak, longest_streak, last_activity_date, updated_at)
  VALUES (_user_id, _xp_amount, public.xp_level(_xp_amount), next_streak, next_streak, current_date, now())
  ON CONFLICT (user_id) DO UPDATE
  SET
    overall_xp = public.user_progress.overall_xp + EXCLUDED.overall_xp,
    overall_level = public.xp_level(public.user_progress.overall_xp + EXCLUDED.overall_xp),
    current_streak = next_streak,
    longest_streak = greatest(public.user_progress.longest_streak, next_streak),
    last_activity_date = current_date,
    updated_at = now();

  IF _sport IS NOT NULL AND length(trim(_sport)) > 0 THEN
    INSERT INTO public.user_sport_profiles (user_id, sport, xp, level, updated_at)
    VALUES (_user_id, _sport, _xp_amount, public.xp_level(_xp_amount), now())
    ON CONFLICT (user_id, sport) DO UPDATE
    SET
      xp = public.user_sport_profiles.xp + EXCLUDED.xp,
      level = public.xp_level(public.user_sport_profiles.xp + EXCLUDED.xp),
      updated_at = now();
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_match_host_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.award_xp(NEW.host_id, NEW.sport, 'match_hosted', 'matches', NEW.id, 100, jsonb_build_object('title', NEW.title));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_match_join_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m record;
BEGIN
  SELECT id, host_id, sport, title INTO m FROM public.matches WHERE id = NEW.match_id;
  IF m.id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.user_progress
  SET games_played = games_played + 1, updated_at = now()
  WHERE user_id = NEW.user_id;

  INSERT INTO public.user_progress (user_id, games_played, updated_at)
  VALUES (NEW.user_id, 1, now())
  ON CONFLICT (user_id) DO NOTHING;

  IF m.sport IS NOT NULL THEN
    INSERT INTO public.user_sport_profiles (user_id, sport, skill_level, games_played, updated_at)
    SELECT NEW.user_id, m.sport, p.skill_level, 1, now()
    FROM public.profiles p
    WHERE p.id = NEW.user_id
    ON CONFLICT (user_id, sport) DO UPDATE
    SET games_played = public.user_sport_profiles.games_played + 1,
        skill_level = COALESCE(public.user_sport_profiles.skill_level, EXCLUDED.skill_level),
        updated_at = now();
  END IF;

  IF NEW.user_id <> m.host_id THEN
    PERFORM public.award_xp(NEW.user_id, m.sport, 'match_joined', 'match_participants', NEW.id, 50, jsonb_build_object('match_id', NEW.match_id, 'title', m.title));
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_match_completion_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participant record;
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM NEW.status THEN
    FOR participant IN
      SELECT user_id FROM public.match_participants WHERE match_id = NEW.id
    LOOP
      PERFORM public.award_xp(participant.user_id, NEW.sport, 'match_completed', 'matches', NEW.id, 150, jsonb_build_object('title', NEW.title));
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_connection_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE public.user_progress
    SET sports_friends_made = sports_friends_made + 1, updated_at = now()
    WHERE user_id = NEW.user_a;

    INSERT INTO public.user_progress (user_id, sports_friends_made, updated_at)
    VALUES (NEW.user_a, 1, now())
    ON CONFLICT (user_id) DO NOTHING;

    UPDATE public.user_progress
    SET sports_friends_made = sports_friends_made + 1, updated_at = now()
    WHERE user_id = NEW.user_b;

    INSERT INTO public.user_progress (user_id, sports_friends_made, updated_at)
    VALUES (NEW.user_b, 1, now())
    ON CONFLICT (user_id) DO NOTHING;

    PERFORM public.award_xp(NEW.user_a, NULL, 'connection_made', 'connections', NEW.id, 75, '{}'::jsonb);
    PERFORM public.award_xp(NEW.user_b, NULL, 'connection_made', 'connections', NEW.id, 75, '{}'::jsonb);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_badge_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_progress
  SET badges_earned = badges_earned + 1, updated_at = now()
  WHERE user_id = NEW.user_id;

  INSERT INTO public.user_progress (user_id, badges_earned, updated_at)
  VALUES (NEW.user_id, 1, now())
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM public.award_xp(NEW.user_id, NULL, 'badge_earned', 'badges', NEW.id, 25, jsonb_build_object('badge_key', NEW.badge_key));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_user_sport_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sport_name text;
BEGIN
  INSERT INTO public.user_progress (user_id, updated_at)
  VALUES (NEW.id, now())
  ON CONFLICT (user_id) DO NOTHING;

  FOREACH sport_name IN ARRAY COALESCE(NEW.sports, '{}'::text[])
  LOOP
    IF sport_name IS NOT NULL AND length(trim(sport_name)) > 0 THEN
      INSERT INTO public.user_sport_profiles (user_id, sport, skill_level, updated_at)
      VALUES (NEW.id, sport_name, NEW.skill_level, now())
      ON CONFLICT (user_id, sport) DO UPDATE
      SET
        skill_level = COALESCE(EXCLUDED.skill_level, public.user_sport_profiles.skill_level),
        updated_at = now();
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_sport_profiles ON public.profiles;
CREATE TRIGGER trg_sync_user_sport_profiles
AFTER INSERT OR UPDATE OF sports, skill_level ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_sport_profiles();

DROP TRIGGER IF EXISTS trg_xp_match_hosted ON public.matches;
CREATE TRIGGER trg_xp_match_hosted
AFTER INSERT ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.award_match_host_xp();

DROP TRIGGER IF EXISTS trg_xp_match_joined ON public.match_participants;
CREATE TRIGGER trg_xp_match_joined
AFTER INSERT ON public.match_participants
FOR EACH ROW EXECUTE FUNCTION public.award_match_join_xp();

DROP TRIGGER IF EXISTS trg_xp_match_completed ON public.matches;
CREATE TRIGGER trg_xp_match_completed
AFTER UPDATE OF status ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.award_match_completion_xp();

DROP TRIGGER IF EXISTS trg_xp_connection_accepted ON public.connections;
CREATE TRIGGER trg_xp_connection_accepted
AFTER INSERT OR UPDATE OF status ON public.connections
FOR EACH ROW EXECUTE FUNCTION public.award_connection_xp();

DROP TRIGGER IF EXISTS trg_xp_badge_earned ON public.badges;
CREATE TRIGGER trg_xp_badge_earned
AFTER INSERT ON public.badges
FOR EACH ROW EXECUTE FUNCTION public.award_badge_xp();

INSERT INTO public.user_progress (user_id, games_played, sports_friends_made, badges_earned, updated_at)
SELECT
  p.id,
  COALESCE(mp.games_played, 0),
  COALESCE(cn.friends_made, 0),
  COALESCE(bg.badges_earned, 0),
  now()
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, count(*)::integer AS games_played
  FROM public.match_participants
  GROUP BY user_id
) mp ON mp.user_id = p.id
LEFT JOIN (
  SELECT user_id, count(*)::integer AS badges_earned
  FROM public.badges
  GROUP BY user_id
) bg ON bg.user_id = p.id
LEFT JOIN (
  SELECT user_id, count(*)::integer AS friends_made
  FROM (
    SELECT user_a AS user_id FROM public.connections WHERE status = 'accepted'
    UNION ALL
    SELECT user_b AS user_id FROM public.connections WHERE status = 'accepted'
  ) x
  GROUP BY user_id
) cn ON cn.user_id = p.id
ON CONFLICT (user_id) DO UPDATE
SET
  games_played = EXCLUDED.games_played,
  sports_friends_made = EXCLUDED.sports_friends_made,
  badges_earned = EXCLUDED.badges_earned,
  updated_at = now();

INSERT INTO public.user_sport_profiles (user_id, sport, skill_level, games_played, updated_at)
SELECT
  p.id,
  sport,
  p.skill_level,
  0,
  now()
FROM public.profiles p
CROSS JOIN LATERAL unnest(COALESCE(p.sports, '{}'::text[])) AS sport
WHERE sport IS NOT NULL AND length(trim(sport)) > 0
ON CONFLICT (user_id, sport) DO UPDATE
SET
  skill_level = COALESCE(public.user_sport_profiles.skill_level, EXCLUDED.skill_level),
  updated_at = now();

INSERT INTO public.user_sport_profiles (user_id, sport, skill_level, games_played, updated_at)
SELECT
  mp.user_id,
  m.sport,
  p.skill_level,
  count(*)::integer,
  now()
FROM public.match_participants mp
JOIN public.matches m ON m.id = mp.match_id
LEFT JOIN public.profiles p ON p.id = mp.user_id
GROUP BY mp.user_id, m.sport, p.skill_level
ON CONFLICT (user_id, sport) DO UPDATE
SET
  games_played = EXCLUDED.games_played,
  skill_level = COALESCE(public.user_sport_profiles.skill_level, EXCLUDED.skill_level),
  updated_at = now();

SELECT public.award_xp(host_id, sport, 'match_hosted', 'matches', id, 100, jsonb_build_object('title', title))
FROM public.matches;

SELECT public.award_xp(mp.user_id, m.sport, 'match_joined', 'match_participants', mp.id, 50, jsonb_build_object('match_id', mp.match_id, 'title', m.title))
FROM public.match_participants mp
JOIN public.matches m ON m.id = mp.match_id
WHERE mp.user_id <> m.host_id;

SELECT public.award_xp(mp.user_id, m.sport, 'match_completed', 'matches', m.id, 150, jsonb_build_object('title', m.title))
FROM public.match_participants mp
JOIN public.matches m ON m.id = mp.match_id
WHERE m.status = 'completed';

SELECT public.award_xp(user_a, NULL, 'connection_made', 'connections', id, 75, '{}'::jsonb)
FROM public.connections
WHERE status = 'accepted';

SELECT public.award_xp(user_b, NULL, 'connection_made', 'connections', id, 75, '{}'::jsonb)
FROM public.connections
WHERE status = 'accepted';

SELECT public.award_xp(user_id, NULL, 'badge_earned', 'badges', id, 25, jsonb_build_object('badge_key', badge_key))
FROM public.badges;

REVOKE EXECUTE ON FUNCTION public.xp_level(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, text, text, text, uuid, integer, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_match_host_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_match_join_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_match_completion_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_connection_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_badge_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_user_sport_profiles() FROM PUBLIC, anon, authenticated;
