-- Phase 1.5 progression refinement.
-- Reversible rollback outline:
--   UPDATE public.xp_events SET is_valid = true, invalidated_at = NULL, invalidation_reason = NULL WHERE event_type = 'match_joined';
--   UPDATE public.xp_events SET xp_amount = 100 WHERE event_type = 'match_hosted';
--   UPDATE public.xp_events SET xp_amount = 75 WHERE event_type = 'connection_made';
--   Recreate Phase 1 versions of award_* functions if needed.
--   ALTER TABLE public.xp_events DROP COLUMN IF EXISTS invalidation_reason;
--   ALTER TABLE public.xp_events DROP COLUMN IF EXISTS invalidated_at;
--   ALTER TABLE public.xp_events DROP COLUMN IF EXISTS is_valid;

ALTER TABLE public.xp_events
  ADD COLUMN IF NOT EXISTS is_valid boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS invalidated_at timestamptz,
  ADD COLUMN IF NOT EXISTS invalidation_reason text;

UPDATE public.xp_events
SET
  is_valid = false,
  invalidated_at = COALESCE(invalidated_at, now()),
  invalidation_reason = COALESCE(invalidation_reason, 'Phase 1.5: joining a match no longer awards XP')
WHERE event_type = 'match_joined'
  AND is_valid = true;

UPDATE public.xp_events
SET xp_amount = 40
WHERE event_type = 'match_hosted'
  AND xp_amount <> 40;

UPDATE public.xp_events
SET xp_amount = 50
WHERE event_type = 'connection_made'
  AND xp_amount <> 50;

CREATE OR REPLACE FUNCTION public.xp_level(_xp integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN greatest(_xp, 0) < 100 THEN 1
    WHEN greatest(_xp, 0) < 250 THEN 2
    WHEN greatest(_xp, 0) < 450 THEN 3
    WHEN greatest(_xp, 0) < 700 THEN 4
    WHEN greatest(_xp, 0) < 1000 THEN 5
    WHEN greatest(_xp, 0) < 1400 THEN 6
    WHEN greatest(_xp, 0) < 1900 THEN 7
    WHEN greatest(_xp, 0) < 2500 THEN 8
    WHEN greatest(_xp, 0) < 3200 THEN 9
    ELSE 10 + floor((greatest(_xp, 0) - 3200)::numeric / 800)::integer
  END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_user_progress(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_xp integer;
  completed_games integer;
  accepted_friends integer;
  badge_count integer;
  current_streak_count integer := 0;
  longest_streak_count integer := 0;
  latest_active_day date;
BEGIN
  IF _user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(sum(xp_amount), 0)::integer
  INTO total_xp
  FROM public.xp_events
  WHERE user_id = _user_id
    AND is_valid = true;

  SELECT count(DISTINCT m.id)::integer
  INTO completed_games
  FROM public.match_participants mp
  JOIN public.matches m ON m.id = mp.match_id
  WHERE mp.user_id = _user_id
    AND m.status = 'completed';

  SELECT count(*)::integer
  INTO accepted_friends
  FROM public.connections c
  WHERE c.status = 'accepted'
    AND (_user_id = c.user_a OR _user_id = c.user_b);

  SELECT count(*)::integer
  INTO badge_count
  FROM public.badges b
  WHERE b.user_id = _user_id;

  WITH active_days AS (
    SELECT DISTINCT created_at::date AS active_day
    FROM public.xp_events
    WHERE user_id = _user_id
      AND is_valid = true
      AND event_type IN ('match_completed','connection_made','badge_earned')
  ),
  grouped AS (
    SELECT
      active_day,
      active_day - (row_number() OVER (ORDER BY active_day))::integer AS streak_group
    FROM active_days
  ),
  streaks AS (
    SELECT streak_group, min(active_day) AS start_day, max(active_day) AS end_day, count(*)::integer AS len
    FROM grouped
    GROUP BY streak_group
  )
  SELECT
    COALESCE(max(len), 0),
    max(end_day),
    COALESCE(max(len) FILTER (WHERE end_day IN (current_date, current_date - 1)), 0)
  INTO longest_streak_count, latest_active_day, current_streak_count
  FROM streaks;

  INSERT INTO public.user_progress (
    user_id,
    overall_xp,
    overall_level,
    current_streak,
    longest_streak,
    last_activity_date,
    games_played,
    sports_friends_made,
    badges_earned,
    updated_at
  )
  VALUES (
    _user_id,
    total_xp,
    public.xp_level(total_xp),
    COALESCE(current_streak_count, 0),
    COALESCE(longest_streak_count, 0),
    latest_active_day,
    COALESCE(completed_games, 0),
    COALESCE(accepted_friends, 0),
    COALESCE(badge_count, 0),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    overall_xp = EXCLUDED.overall_xp,
    overall_level = EXCLUDED.overall_level,
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    last_activity_date = EXCLUDED.last_activity_date,
    games_played = EXCLUDED.games_played,
    sports_friends_made = EXCLUDED.sports_friends_made,
    badges_earned = EXCLUDED.badges_earned,
    updated_at = now();

  INSERT INTO public.user_sport_profiles (user_id, sport, skill_level, updated_at)
  SELECT _user_id, sport, p.skill_level, now()
  FROM public.profiles p
  CROSS JOIN LATERAL unnest(COALESCE(p.sports, '{}'::text[])) AS sport
  WHERE p.id = _user_id
    AND sport IS NOT NULL
    AND length(trim(sport)) > 0
  ON CONFLICT (user_id, sport) DO UPDATE
  SET
    skill_level = COALESCE(public.user_sport_profiles.skill_level, EXCLUDED.skill_level),
    updated_at = now();

  INSERT INTO public.user_sport_profiles (user_id, sport, updated_at)
  SELECT DISTINCT _user_id, xe.sport, now()
  FROM public.xp_events xe
  WHERE xe.user_id = _user_id
    AND xe.is_valid = true
    AND xe.sport IS NOT NULL
    AND length(trim(xe.sport)) > 0
  ON CONFLICT (user_id, sport) DO NOTHING;

  INSERT INTO public.user_sport_profiles (user_id, sport, updated_at)
  SELECT DISTINCT _user_id, m.sport, now()
  FROM public.match_participants mp
  JOIN public.matches m ON m.id = mp.match_id
  WHERE mp.user_id = _user_id
    AND m.status = 'completed'
    AND m.sport IS NOT NULL
  ON CONFLICT (user_id, sport) DO NOTHING;

  UPDATE public.user_sport_profiles usp
  SET
    xp = COALESCE((
      SELECT sum(xe.xp_amount)::integer
      FROM public.xp_events xe
      WHERE xe.user_id = usp.user_id
        AND xe.sport = usp.sport
        AND xe.is_valid = true
    ), 0),
    level = public.xp_level(COALESCE((
      SELECT sum(xe.xp_amount)::integer
      FROM public.xp_events xe
      WHERE xe.user_id = usp.user_id
        AND xe.sport = usp.sport
        AND xe.is_valid = true
    ), 0)),
    games_played = COALESCE((
      SELECT count(DISTINCT m.id)::integer
      FROM public.match_participants mp
      JOIN public.matches m ON m.id = mp.match_id
      WHERE mp.user_id = usp.user_id
        AND m.sport = usp.sport
        AND m.status = 'completed'
    ), 0),
    updated_at = now()
  WHERE usp.user_id = _user_id;
END;
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
BEGIN
  IF _user_id IS NULL OR _source_id IS NULL OR _xp_amount <= 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.xp_events (user_id, sport, event_type, source_table, source_id, xp_amount, metadata, is_valid)
  VALUES (_user_id, _sport, _event_type, _source_table, _source_id, _xp_amount, COALESCE(_metadata, '{}'::jsonb), true)
  ON CONFLICT (user_id, event_type, source_table, source_id) DO NOTHING;

  PERFORM public.recompute_user_progress(_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.award_match_host_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.award_xp(NEW.host_id, NEW.sport, 'match_hosted', 'matches', NEW.id, 40, jsonb_build_object('title', NEW.title));
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
  SELECT id, sport INTO m FROM public.matches WHERE id = NEW.match_id;
  IF m.id IS NULL THEN
    RETURN NEW;
  END IF;

  IF m.sport IS NOT NULL THEN
    INSERT INTO public.user_sport_profiles (user_id, sport, skill_level, updated_at)
    SELECT NEW.user_id, m.sport, p.skill_level, now()
    FROM public.profiles p
    WHERE p.id = NEW.user_id
    ON CONFLICT (user_id, sport) DO UPDATE
    SET
      skill_level = COALESCE(public.user_sport_profiles.skill_level, EXCLUDED.skill_level),
      updated_at = now();
  END IF;

  PERFORM public.recompute_user_progress(NEW.user_id);
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
    PERFORM public.award_xp(NEW.user_a, NULL, 'connection_made', 'connections', NEW.id, 50, '{}'::jsonb);
    PERFORM public.award_xp(NEW.user_b, NULL, 'connection_made', 'connections', NEW.id, 50, '{}'::jsonb);
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

  PERFORM public.recompute_user_progress(NEW.id);
  RETURN NEW;
END;
$$;

SELECT public.recompute_user_progress(id)
FROM public.profiles;

REVOKE EXECUTE ON FUNCTION public.recompute_user_progress(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.xp_level(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, text, text, text, uuid, integer, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_match_host_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_match_join_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_match_completion_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_connection_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_badge_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_user_sport_profiles() FROM PUBLIC, anon, authenticated;
