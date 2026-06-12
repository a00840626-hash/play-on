# Mejoras Sección Conecta

## 1. Modelo de datos (`demo_players`)

Migración SQL para añadir dos columnas:

- `skill_level text` — valores: `'principiante' | 'intermedio' | 'avanzado'`
- `availability text[]` — días, ej. `{'sab','dom'}`

Después un UPDATE por id (o determinístico via hash del id) que asigna valores variados a los jugadores demo existentes, para que cada card muestre algo plausible.

Actualizar la interfaz `DemoPlayer` en `ConectaHub.tsx` con los dos campos nuevos.

## 2. Tarjetas de jugador (card grid)

Debajo de los sport chips, añadir dos líneas compactas que respeten el estilo brutalista:

```text
[NIVEL · INTERMEDIO]      ← chip mono uppercase, borde sutil, color según nivel
SÁB · DOM                 ← texto mono muted, tracking-widest
```

- Nivel: chip pequeño tipo pill, con color (principiante=azul, intermedio=verde primary, avanzado=naranja accent).
- Disponibilidad: días abreviados (Lun, Mar, Mié, Jue, Vie, Sáb, Dom) separados por `·`, fuente mono, muted-foreground.
- Helper `formatAvailability(days: string[])` y `skillMeta(level)` para colores/labels.

## 3. Botón "Ver perfil" → Bottom Sheet

Nuevo estado `profilePlayer: DemoPlayer | null` y `<Sheet>` lateral `side="bottom"` con:

- **Header**: avatar 96px con anillo verde si online, nombre (Bebas Neue 3xl), municipio + distancia con `MapPin`, badge "EN LÍNEA" si aplica.
- **Rating**: 5 estrellas (rellenas según `rating`), número grande + "rating".
- **Deportes**: chips grandes con los colores ya definidos en `sportColors`.
- **Stats row** (3 columnas): Nivel · Disponibilidad · Partidos jugados (mock: derivado del hash del id, p.ej. 12–80).
- **Último partido**: tomado de `conn.last_played` si existe, si no "—".
- **Bio**: si `p.bio` existe.
- **CTA inferior sticky**: 
  - Sin conexión → botón "Conectar" (verde glow) que llama `connect(p)` y cierra sheet.
  - `pending` → "Solicitud enviada" disabled.
  - `accepted` → "Chatear" que navega a `/chat/${conn.id}`.

Estilo: fondo `bg-card`, bordes `border-border`, esquinas `rounded-t-3xl`, drag handle igual que el sheet de municipio, scroll interno, `max-h-[90vh]`.

## 4. Archivos a tocar

- `supabase/migrations/<timestamp>_demo_players_skill_availability.sql` — añadir columnas + UPDATEs demo.
- `src/components/ConectaHub.tsx` — interfaz, helpers, render de card, nuevo `<Sheet>` de perfil, handler del botón.

Sin cambios en otros componentes.
