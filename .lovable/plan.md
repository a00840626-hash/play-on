# Plan: Partidos Abiertos con cobro por jugador

## Hallazgos del código actual

**1. Bookings / reservas de cancha** — Sí existe `public.bookings`:
- Campos: `court_id`, `user_id`, `starts_at`, `duration_minutes`, `total_price`, `status`, `payment_method`, `notes`.
- Representa la reserva completa de una cancha por **un solo usuario** (el que reserva). No tiene noción de "cupos" ni de cobro dividido.

**2. Profiles / info de jugador** — Sí, `public.profiles` ya tiene lo necesario:
- `sports[]`, `skill_level`, `availability[]`, `bio`, `municipio`, `colonia`, `rating`, `avatar_url`, `display_name`, `onboarded`.
- No hay "posición preferida" (ej. portero, defensa) — se puede agregar si se quiere matchmaking más fino.

**3. Stripe** — **No está integrado todavía**. No hay edge functions, ni secretos de Stripe, ni código que lo referencie. El campo `bookings.payment_method` existe pero no hay flujo de cobro real; las matches ya tienen `price_per_player` pero también sin cobro.

Además ya existen `public.matches` y `public.match_participants` muy cercanos a lo que se pide:
- `matches`: `host_id`, `sport`, `court_id`, `starts_at`, `max_players`, `skill_level`, `price_per_player`, `status`.
- `match_participants`: `match_id`, `user_id`, `status`, `joined_at`.

Recomendación: **extender `matches` en vez de crear `open_matches`**, para no duplicar.

---

## Modelo de datos propuesto

### Extender `matches`
Agregar:
- `is_open boolean default true` — distingue partido abierto vs cerrado/privado.
- `visibility text` — `public` | `private` (link) | `friends`.
- `format text` — ej. "5v5", "7v7", "2v2".
- `min_skill_level` / `max_skill_level` — filtro de nivel permitido.
- `booking_id uuid` (nullable, FK a `bookings`) — si el organizador ya reservó la cancha, vincula.
- `cancellation_policy text` — `flexible` | `strict`.
- `status` ampliado: `open` | `full` | `confirmed` | `cancelled` | `completed`.

### Extender `match_participants`
- `payment_status text` — `pending` | `paid` | `refunded` | `failed`.
- `payment_intent_id text` — id de Stripe.
- `amount_paid numeric`.
- `role text` (opcional) — `host` | `player` | `substitute`.
- `paid_at timestamptz`.
- Constraint: `UNIQUE(match_id, user_id)` para evitar duplicados.

### Nueva tabla `match_payments` (opcional pero recomendada)
Para auditoría completa de cobros independiente de `match_participants`:
- `match_id`, `user_id`, `stripe_payment_intent_id`, `amount`, `currency`, `status`, `refunded_at`, `failure_reason`.

### Cambio en `handle_new_user` / `notify_match_join`
El trigger `notify_match_join` ya existe — extender para que ignore `status='pending'` y notifique solo cuando `payment_status='paid'`.

---

## Flujos

### A. Crear partido abierto (organizador)
1. Organizador elige deporte, cancha (de `courts` o ubicación libre), fecha/hora, duración, formato (define `max_players`), nivel mínimo/máximo, precio por persona, notas.
2. (Opcional) Si la cancha está en plataforma → crear `booking` en estado `pending` y vincular `match.booking_id`. El costo total de la cancha se reparte: `price_per_player = ceil(court_total / max_players)`.
3. Insertar `match` con `is_open=true`, `status='open'`, `host_id=auth.uid()`.
4. Auto-insertar al organizador en `match_participants` con `role='host'`, `payment_status='paid'` (o `exempt` si la política es que el host no paga su lugar; a confirmar).

**Decisión a confirmar:** ¿El host paga su propio lugar? Asumo **sí**, paga igual que los demás cuando se crea el match (cobro inmediato vía Stripe).

### B. Unirse a un partido (jugador)
1. Jugador filtra partidos por deporte, municipio, nivel, fecha. Ve `cupos_disponibles = max_players - count(participants paid)`.
2. Tap "Unirme" → se crea `match_participants` con `payment_status='pending'`.
3. Edge function `create-match-checkout` crea un Stripe Checkout Session / PaymentIntent por `price_per_player`. Devuelve URL.
4. Cliente redirige a Stripe. Al volver, webhook `stripe-webhook` recibe `payment_intent.succeeded` → marca `payment_status='paid'`, `paid_at=now()`.
5. Si el pago falla / se abandona, una edge function programada (o el mismo webhook con `payment_intent.payment_failed`) libera el cupo borrando o marcando `failed` el row de `match_participants` tras X minutos.

**Reserva de cupo:** mientras el pago está `pending` cuenta como ocupado por máx. 10 minutos.

### C. Cupo lleno
- Trigger `after insert/update on match_participants`: si `count(paid) >= max_players` → `matches.status = 'full'`.
- Notificar (`notifications`) al host: "Tu partido está completo".
- Notificar a todos los participantes pagados: "Partido confirmado".
- Bloquear nuevos joins (RLS / check en edge function).
- Si está vinculado a `booking`, marcar booking como `confirmed`.

### D. Cancelaciones / reembolsos
- Jugador cancela ≥24h antes → reembolso completo vía Stripe Refund; libera cupo; `matches.status` vuelve a `open` si estaba `full`.
- Jugador cancela <24h → sin reembolso (policy `strict`) o parcial (policy `flexible`).
- Host cancela → reembolso total a todos los participantes, `matches.status='cancelled'`, notificación masiva.

---

## RLS policies necesarias

**matches**
- `SELECT`: cualquiera autenticado puede ver matches con `is_open=true AND status IN ('open','full','confirmed')`. Privados solo si `host_id = auth.uid()` o existe row en `match_participants`.
- `INSERT`: `auth.uid() = host_id`.
- `UPDATE`: solo `host_id = auth.uid()` (cambios de detalles, cancelación). El cambio de `status` a `full` lo hace un trigger SECURITY DEFINER, no el cliente.
- `DELETE`: solo host y solo si no hay pagos confirmados (o reemplazar por cancelación).

**match_participants**
- `SELECT`: usuario ve sus propios rows; host del match ve todos los del partido; el resto ve solo `user_id` + `display_name` (vía vista pública `match_roster`).
- `INSERT`: `auth.uid() = user_id` AND match abierto AND cupo disponible AND nivel cumple. La verificación de cupo va en una función SECURITY DEFINER `request_join_match(match_id)` para evitar race conditions; RLS solo permite que el dueño del row se inserte a sí mismo.
- `UPDATE`: solo el propio usuario puede cancelar (cambiar a `status='cancelled'`); webhook usa `service_role`.
- `DELETE`: ninguno desde cliente (cancelación = update).

**match_payments**
- `SELECT`: solo el dueño (`user_id = auth.uid()`) y host del match.
- `INSERT/UPDATE`: solo `service_role` (edge functions / webhook).

**bookings** (sin cambio mayor): si el booking nace de un match abierto, el host es el `user_id` del booking; participantes lo ven vía join con `matches`.

---

## Stripe — integración a montar

Como no existe, hay que:
1. Recomendar provider (Lovable Payments — Stripe seamless). Confirmar plan Pro.
2. Habilitar Stripe payments, crear un único Price tipo "Match Spot" dinámico (custom amount) o crear Price por match.
3. Edge functions necesarias:
   - `create-match-checkout` (verify JWT) — crea Checkout Session, guarda `payment_intent_id` en `match_participants`.
   - `stripe-webhook` (sin JWT, verify signature) — procesa `payment_intent.succeeded`, `.payment_failed`, `charge.refunded`.
   - `cancel-match-spot` — refund + liberar cupo.
4. Comisión de plataforma: definir % (ej. 8%) descontado del `price_per_player` antes de pagar al host/cancha. A confirmar con el usuario.

---

## Preguntas abiertas (a confirmar antes de implementar)

1. ¿El host paga su propio lugar o entra gratis?
2. ¿La cancha siempre se reserva en plataforma, o se permite "ubicación libre" sin booking?
3. ¿Comisión de plataforma %? ¿El dinero va al dueño de la cancha, al host, o queda en custodia hasta que se juegue el partido?
4. ¿Política de cancelación por defecto (flexible vs strict)?
5. ¿Lista de espera cuando está lleno?
6. ¿Filtro por posición/rol (portero, etc.) o solo nivel y deporte?
