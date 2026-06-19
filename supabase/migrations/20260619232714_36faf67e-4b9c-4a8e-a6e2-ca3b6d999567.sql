
DROP POLICY IF EXISTS "system or self insert notif" ON public.notifications;
CREATE POLICY "self insert notif" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

REVOKE EXECUTE ON FUNCTION public.notify_match_join() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_booking_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
