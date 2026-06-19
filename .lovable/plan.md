# PlayOn — Plan para App Store Submission

## Estado actual
- ✅ Auth real Supabase (email/password + Google)
- ✅ Onboarding (nombre, foto, municipio, deportes, nivel, disponibilidad)
- ✅ Tablas reales: `profiles`, `connections`, `messages`, `badges`, `signups`
- ✅ Tablas demo: `demo_players/connections/messages` (visibles a todos los autenticados hoy)
- ✅ Capacitor configurado (appId, appName)
- ⚠️ `Matches`, `Courts`, `Profile`, `OwnerDashboard` usan 100% mock data
- ⚠️ `ConectaHub` mezcla perfiles reales + demos
- ⚠️ Sin recuperar contraseña, sin storage para fotos (base64 en DB)
- ⚠️ Sin íconos/splash nativos, sin Info.plist con permisos

---

## Fase 1 — Auth + Perfiles completos
1. Página `/reset-password` + flujo "Olvidé contraseña" en Login
2. Storage bucket `avatars` (público) — subir foto en onboarding y perfil
3. Página `/profile/edit` para editar datos del onboarding
4. `Profile.tsx` lee del perfil real del usuario (no Andrea Posadas hardcodeada)
5. Cerrar sesión funcional + eliminar cuenta
6. Confirmar email obligatorio ya está activo

## Fase 2 — Comunidad real (separar de demo)
1. `ConectaHub` muestra **solo perfiles reales** cuando el usuario está autenticado
2. Conexiones reales usan tabla `connections` (no `demo_connections`)
3. Chat real usa tabla `messages` (no `demo_messages`)
4. Demos se mantienen solo en la landing pública (Home)
5. Búsqueda por municipio + deporte real
6. Realtime para nuevos mensajes + solicitudes de conexión

## Fase 3 — Partidos
1. Tabla `matches` (host_id, sport, court_id, datetime, max_players, skill, price, status)
2. Tabla `match_participants` (match_id, user_id, status)
3. `Matches.tsx`: tabs próximos/pasados/cancelados desde DB
4. `NewMatch.tsx` crea partido real
5. `MatchDetail.tsx` permite unirse/salir, lista participantes
6. Notificación in-app cuando alguien se une a tu partido

## Fase 4 — Canchas
1. Tabla `courts` (name, sport, address, lat, lng, price_per_hour, amenities, owner_id)
2. Tabla `court_slots` o lógica de disponibilidad
3. Tabla `bookings` (court_id, user_id, slot_datetime, status, paid)
4. Seed inicial: las 5 canchas actuales como datos reales
5. `Courts.tsx` y `CourtDetail.tsx` leen de DB
6. Reservar slot → crea booking (sin pago, por ahora marcar como "Pagar en cancha")
7. `OwnerDashboard.tsx` lista bookings de las canchas del owner

## Fase 5 — Capacitor + iOS build
1. Generar ícono adaptive (1024×1024) + splash screen
2. Actualizar `capacitor.config.ts` con splash y status bar
3. Instalar `@capacitor/splash-screen`, `@capacitor/status-bar`, `@capacitor/app`
4. Configurar `Info.plist` (permisos de cámara para foto perfil, ubicación opcional)
5. Configurar deep link para reset password (`playon://reset-password`)
6. Documentar pasos finales: `npx cap sync ios`, abrir Xcode, signing, archive, App Store Connect
7. Crear assets requeridos por App Store: screenshots 6.7", privacy policy URL

---

## Decisiones aún por confirmar
- **Pagos**: ¿reservar cancha sin cobrar (pago en sitio) o integrar Stripe en V1?
- **Notificaciones in-app**: ¿toast + badge en bottom nav, o sin nada por ahora?
- **Eliminar cuenta**: requerido por App Store si hay auth — confirmamos que sí
- **Privacy Policy + Terms**: necesitas URLs públicas, ¿genero páginas estáticas?
