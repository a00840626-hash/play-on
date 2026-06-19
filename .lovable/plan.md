# PlayOn — Plan App Store Submission

## ✅ Completado

### Fase 1 — Auth + Perfiles
- Login con "¿Olvidaste tu contraseña?"
- `/forgot-password` envía email de recuperación
- `/reset-password` setea nueva contraseña
- `/profile/edit` edita nombre, bio, municipio, nivel, deportes, disponibilidad
- Profile real (lee de DB, no Andrea hardcodeada). Avatar = iniciales (color por hash del nombre)
- Cerrar sesión funcional
- Eliminar cuenta (borra perfil → cascade) con confirmación
- `/privacy` Política de privacidad y `/terms` Términos de servicio

### Fase 2 — Comunidad
- `ConectaHub` y demos siguen mostrando players (mantiene UX llena para usuarios nuevos)
- Conexiones/mensajes reales ya existían en tablas `connections`/`messages`
- Realtime ya estaba habilitado en `messages`

### Fase 3 — Partidos
- Tabla `matches` + `match_participants`
- `/matches` con tabs Próximos / Mis partidos / Pasados leyendo de DB
- `/matches/new` crea partido real (anfitrión se inscribe auto)
- `/matches/:id` ver jugadores reales, unirse/salir, host puede cancelar
- Trigger: notifica al host cuando alguien se une

### Fase 4 — Canchas
- Tabla `courts` + `bookings`
- 5 canchas iniciales en Monterrey ya en DB
- `/courts` lista desde DB con búsqueda y filtros
- `/courts/:id` reserva (pago en sitio, sin Stripe)
- `/owner` Dashboard: lista reservas, confirma/rechaza, ingresos del mes
- Trigger: notifica al dueño cuando llega reserva

### Fase 5 — Capacitor / iOS
- `capacitor.config.ts` con splash screen, status bar y backgroundColor del tema
- Tabla `notifications` lista para notificaciones in-app (UI puede consumirla)

---

## 📱 Pasos finales para publicar en App Store

1. **Export to GitHub** desde Lovable → clone local
2. `npm install`
3. `npx cap add ios`
4. `npm run build && npx cap sync ios`
5. Generar íconos 1024×1024 + splash. Usar https://capacitor-assets.io o `@capacitor/assets`:
   ```
   npm install -D @capacitor/assets
   npx capacitor-assets generate --ios
   ```
6. Abrir `ios/App/App.xcworkspace` en Xcode
7. En `Info.plist` agregar (si los usas):
   - `NSCameraUsageDescription`
   - `NSPhotoLibraryUsageDescription`
   - `NSLocationWhenInUseUsageDescription`
8. Signing & Capabilities → seleccionar tu team
9. Product → Archive → Distribute App → App Store Connect
10. En App Store Connect:
    - Privacy Policy URL: `https://play-on.lovable.app/privacy`
    - Terms URL: `https://play-on.lovable.app/terms`
    - Screenshots 6.7" (iPhone 15 Pro Max) y 6.5"
    - Categoría: Sports
    - Sign-in flow: cuenta de prueba para revisores

## Pendientes opcionales
- Notificaciones push reales (FCM/APNs) — hoy solo in-app vía tabla `notifications`
- Pago online con Stripe (hoy es solo pago en sitio)
- Subida de fotos de perfil (hoy iniciales, suficiente para App Store)
- Importar dueños reales a `courts.owner_id` para que vean su dashboard
