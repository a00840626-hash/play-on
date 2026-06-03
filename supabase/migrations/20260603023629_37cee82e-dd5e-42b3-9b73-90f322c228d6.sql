-- 1. signups: revoke UPDATE/DELETE grants from authenticated/anon (insert-only)
REVOKE UPDATE, DELETE ON public.signups FROM authenticated;
REVOKE UPDATE, DELETE ON public.signups FROM anon;

-- 2. badges: restrict SELECT to own rows
DROP POLICY IF EXISTS "badges viewable by authenticated" ON public.badges;
CREATE POLICY "users view own badges"
ON public.badges
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Realtime: scope channel subscriptions
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated can receive own connection broadcasts" ON realtime.messages;
CREATE POLICY "authenticated can receive own connection broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.connections c
    WHERE c.id::text = realtime.topic()
      AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
  )
);

-- 4. SECURITY DEFINER function: not directly executable by API roles
REVOKE EXECUTE ON FUNCTION public.is_connection_participant(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_connection_participant(uuid, uuid) TO service_role;