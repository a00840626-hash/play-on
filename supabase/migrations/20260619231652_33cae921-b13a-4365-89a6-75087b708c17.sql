
-- Remove self-claim badge INSERT; badges should only be awarded server-side (service_role / SECURITY DEFINER).
DROP POLICY IF EXISTS "users insert own badges" ON public.badges;

-- Tighten realtime authorization: require accepted connection via is_connection_participant
DROP POLICY IF EXISTS "authenticated can receive own connection broadcasts" ON realtime.messages;
CREATE POLICY "authenticated can receive own connection broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.is_connection_participant((realtime.topic())::uuid, auth.uid()));
