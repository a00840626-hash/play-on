-- Open up demo tables since auth is removed (demo mode)
DROP POLICY IF EXISTS "Users can view their own connections" ON public.demo_connections;
DROP POLICY IF EXISTS "Users can create their own connections" ON public.demo_connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.demo_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON public.demo_connections;

CREATE POLICY "demo open select connections" ON public.demo_connections FOR SELECT USING (true);
CREATE POLICY "demo open insert connections" ON public.demo_connections FOR INSERT WITH CHECK (true);
CREATE POLICY "demo open update connections" ON public.demo_connections FOR UPDATE USING (true);
CREATE POLICY "demo open delete connections" ON public.demo_connections FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can view messages in their connections" ON public.demo_messages;
DROP POLICY IF EXISTS "Users can create messages in their connections" ON public.demo_messages;
DROP POLICY IF EXISTS "Users can update messages in their connections" ON public.demo_messages;

CREATE POLICY "demo open select messages" ON public.demo_messages FOR SELECT USING (true);
CREATE POLICY "demo open insert messages" ON public.demo_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "demo open update messages" ON public.demo_messages FOR UPDATE USING (true);
