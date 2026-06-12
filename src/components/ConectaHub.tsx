import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ivanAvatar from "@/assets/ivan-avatar.jpg";
import diegoAvatar from "@/assets/diego-avatar.jpg";
import anaAvatar from "@/assets/ana-avatar.jpg";
import carlosAvatar from "@/assets/carlos-avatar.jpg";
import marianaAvatar from "@/assets/mariana-avatar.jpg";
import jorgeAvatar from "@/assets/jorge-avatar.jpg";
import paolaAvatar from "@/assets/paola-avatar.jpg";
import renataAvatar from "@/assets/renata-avatar.jpg";
import { Star, MessageCircle, Lock, Check, Zap, ArrowRight, Radio, Search, MapPin, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { badgeCatalog, fmtBadgeDate } from "@/data/badges";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DemoPlayer {
  id: string;
  display_name: string;
  colonia: string;
  distance_km: number;
  sports: string[];
  rating: number;
  avatar_seed: string;
  online: boolean;
  bio?: string | null;
  skill_level?: "principiante" | "intermedio" | "avanzado" | null;
  availability?: string[] | null;
}

const dayLabels: Record<string, string> = {
  lun: "Lun", mar: "Mar", mie: "Mié", jue: "Jue", vie: "Vie", sab: "Sáb", dom: "Dom",
};
const formatAvailability = (days?: string[] | null) =>
  (days && days.length ? days.map((d) => dayLabels[d] || d).join(" · ") : "Flexible");

const skillMeta = (level?: string | null) => {
  switch (level) {
    case "principiante": return { label: "Principiante", color: "#3D9CFF" };
    case "avanzado": return { label: "Avanzado", color: "#FF3D00" };
    case "intermedio": return { label: "Intermedio", color: "#00FF87" };
    default: return { label: "Sin nivel", color: "#888" };
  }
};

const mockMatchesPlayed = (id: string) => 12 + (hashSeed(id) % 69);

interface DemoConn {
  id: string;
  demo_player_id: string;
  status: "none" | "pending" | "accepted";
  last_played: string | null;
}

interface LastMsg { connection_id: string; body: string; sent_at: string; sender: string; }

const sportColors: Record<string, string> = {
  futbol: "#00FF87",
  tenis: "#3D9CFF",
  padel: "#B388FF",
  running: "#FFD740",
  basketball: "#FF6B35",
  voleibol: "#FF3D87",
  tocho: "#7CDB6E",
  americano: "#A87544",
};

const femaleNames = new Set([
  "ana", "mariana", "paola", "renata", "maria", "sofia", "lucia", "carla", "laura", "valeria", "camila", "daniela",
]);
const femaleHints = ["a", "ia"]; // weak fallback by name ending

const guessGender = (seed: string, displayName?: string): "men" | "women" => {
  const key = (seed || "").toLowerCase();
  if (femaleNames.has(key)) return "women";
  const first = (displayName || seed || "").split(" ")[0].toLowerCase().replace(/[^a-záéíóú]/g, "");
  if (femaleNames.has(first)) return "women";
  if (first.endsWith("a") && !["luca", "noa"].includes(first)) return "women";
  return "men";
};

const hashSeed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

// Curated clean headshots — young, attractive faces (Unsplash portrait IDs)
const menPhotos = [
  "photo-1500648767791-00dcc994a43e",
  "photo-1506794778202-cad84cf45f1d",
  "photo-1488161628813-04466f872be2",
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1519085360753-af0119f7cbe7",
  "photo-1504257432389-52343af06ae3",
  "photo-1492562080023-ab3db95bfbce",
  "photo-1531123897727-8f129e1688ce",
  "photo-1463453091185-61582044d556",
  "photo-1539571696357-5a69c17a67c6",
  "photo-1547425260-76bcadfb4f2c",
  "photo-1564564321837-a57b7070ac4f",
];
const womenPhotos = [
  "photo-1494790108377-be9c29b29330",
  "photo-1438761681033-6461ffad8d80",
  "photo-1534528741775-53994a69daeb",
  "photo-1517841905240-472988babdf9",
  "photo-1524504388940-b1c1722653e1",
  "photo-1488426862026-3ee34a7d66df",
  "photo-1502685104226-ee32379fefbe",
  "photo-1508214751196-bcfd4ca60f91",
  "photo-1521252659862-eec69941b071",
  "photo-1496440737103-cd596325d314",
  "photo-1500917293891-ef795e70e1f6",
  "photo-1531746020798-e6953c6e8e04",
];

const customAvatars: Record<string, string> = {
  ivan: ivanAvatar,
  diego: diegoAvatar,
  ana: anaAvatar,
  carlos: carlosAvatar,
  mariana: marianaAvatar,
  jorge: jorgeAvatar,
  paola: paolaAvatar,
  renata: renataAvatar,
};

const Avatar = ({ seed, size = 72, name }: { seed: string; size?: number; name?: string }) => {
  const custom = customAvatars[seed];
  if (custom) {
    return (
      <img
        src={custom}
        alt={seed}
        width={size}
        height={size}
        className="rounded-full bg-secondary object-cover"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }
  const gender = guessGender(seed, name);
  const pool = gender === "women" ? womenPhotos : menPhotos;
  const id = pool[hashSeed(seed) % pool.length];
  const s = Math.round(size * 2);
  return (
    <img
      src={`https://images.unsplash.com/${id}?w=${s}&h=${s}&fit=crop&crop=faces,center&auto=format&q=80`}
      alt={seed}
      width={size}
      height={size}
      className="rounded-full bg-secondary object-cover"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
};



export const ConectaHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [players, setPlayers] = useState<DemoPlayer[]>([]);
  const [conns, setConns] = useState<DemoConn[]>([]);
  const [lastMsgs, setLastMsgs] = useState<Record<string, LastMsg>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [sportFilter, setSportFilter] = useState<string>("todos");
  const [cityFilter, setCityFilter] = useState<string>("todas");
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [confirmPlayer, setConfirmPlayer] = useState<DemoPlayer | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: ps }, { data: cs }] = await Promise.all([
        supabase.from("demo_players").select("*").order("distance_km"),
        supabase.from("demo_connections").select("*").eq("user_id", user.id),
      ]);
      setPlayers((ps as DemoPlayer[]) || []);
      setConns((cs as DemoConn[]) || []);

      const acceptedIds = (cs || []).filter((c) => c.status === "accepted").map((c) => c.id);
      if (acceptedIds.length) {
        const { data: msgs } = await supabase
          .from("demo_messages")
          .select("connection_id, body, sent_at, sender, read_at")
          .in("connection_id", acceptedIds)
          .order("sent_at", { ascending: false });
        const last: Record<string, LastMsg> = {};
        const un: Record<string, number> = {};
        for (const m of (msgs || []) as (LastMsg & { read_at: string | null })[]) {
          if (!last[m.connection_id]) last[m.connection_id] = m;
          if (m.sender === "them" && !m.read_at) un[m.connection_id] = (un[m.connection_id] || 0) + 1;
        }
        setLastMsgs(last);
        setUnread(un);
      }
    })();

    const ch = supabase
      .channel("conecta-conns")
      .on("postgres_changes", { event: "*", schema: "public", table: "demo_connections", filter: `user_id=eq.${user.id}` }, async () => {
        const { data: cs } = await supabase.from("demo_connections").select("*").eq("user_id", user.id);
        setConns((cs as DemoConn[]) || []);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const connByPlayer = useMemo(() => {
    const m: Record<string, DemoConn> = {};
    for (const c of conns) m[c.demo_player_id] = c;
    return m;
  }, [conns]);

  const connect = async (player: DemoPlayer) => {
    if (!user) return;
    const existing = connByPlayer[player.id];
    if (existing?.status === "accepted") {
      navigate(`/chat/${existing.id}`);
      return;
    }
    if (existing?.status === "pending") return;
    setConfirmPlayer(player);
  };

  const sendRequest = async () => {
    if (!user || !confirmPlayer) return;
    const player = confirmPlayer;
    setConfirmPlayer(null);

    const { data, error } = await supabase
      .from("demo_connections")
      .insert({ user_id: user.id, demo_player_id: player.id, status: "pending", last_played: "Pendiente" })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Solicitud enviada", description: `${player.display_name} aceptará en unos segundos…` });

    setTimeout(async () => {
      await supabase.from("demo_connections").update({ status: "accepted", last_played: "Hoy" }).eq("id", data.id);
      await supabase.from("demo_messages").insert({
        connection_id: data.id,
        user_id: user.id,
        sender: "them",
        body: `¡Hola! Vi que jugamos lo mismo. ¿Te late armar algo esta semana?`,
      });
    }, 2500);
  };

  const sportOptions = ["todos", "futbol", "tenis", "padel", "running"];

  // Adultos deportivamente activos por municipio de la ZMM (estimaciones, miles)
  const zmmMunicipios: { name: string; activos: number }[] = [
    { name: "Monterrey", activos: 412000 },
    { name: "Guadalupe", activos: 215000 },
    { name: "Apodaca", activos: 198000 },
    { name: "General Escobedo", activos: 172000 },
    { name: "San Nicolás de los Garza", activos: 156000 },
    { name: "Santa Catarina", activos: 124000 },
    { name: "García", activos: 118000 },
    { name: "Juárez", activos: 96000 },
    { name: "San Pedro Garza García", activos: 78000 },
    { name: "Cadereyta Jiménez", activos: 41000 },
    { name: "Salinas Victoria", activos: 22000 },
    { name: "Santiago", activos: 18000 },
  ];
  const ZMM_TOTAL = 1_550_000;

  const cityOptions = useMemo(() => {
    const sportShare = sportFilter === "todos" ? 1 : 0.28; // share of activos por deporte
    return zmmMunicipios
      .map((m) => {
        const demoExtra = players.filter(
          (p) => p.colonia === m.name && (sportFilter === "todos" || p.sports.includes(sportFilter))
        ).length;
        return { name: m.name, count: Math.round(m.activos * sportShare) + demoExtra };
      })
      .sort((a, b) => b.count - a.count);
  }, [players, sportFilter]);

  const totalInScope = useMemo(() => {
    return cityOptions.reduce((sum, c) => sum + c.count, 0);
  }, [cityOptions]);

  const filteredCityOptions = useMemo(() => {
    const s = citySearch.trim().toLowerCase();
    return s ? cityOptions.filter((c) => c.name.toLowerCase().includes(s)) : cityOptions;
  }, [cityOptions, citySearch]);

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
    return String(n);
  };
  const q = query.trim().toLowerCase();
  const filtered = players
    .filter((p) => sportFilter === "todos" || p.sports.includes(sportFilter))
    .filter((p) => cityFilter === "todas" || p.colonia === cityFilter)
    .filter((p) => !q || p.display_name.toLowerCase().includes(q) || p.colonia.toLowerCase().includes(q));

  const accepted = conns.filter((c) => c.status === "accepted");
  const acceptedPlayers = accepted
    .map((c) => ({ conn: c, player: players.find((p) => p.id === c.demo_player_id)! }))
    .filter((x) => x.player);

  if (!user) {
    return (
      <div className="px-4 mt-8">
        <div className="rounded border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">Inicia sesión para conectar con jugadores cerca de ti.</p>
          <button onClick={() => navigate("/login")} className="h-10 px-4 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs glow-green">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Section A: Players nearby */}
      <section className="mt-6">
        {/* Hero header */}
        <div className="px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/40 p-5">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-bold font-mono uppercase tracking-widest">
                    <Radio size={10} className="animate-pulse" /> En vivo
                  </span>
                  <h2 className="font-display text-3xl leading-none mt-2">JUGADORES</h2>
                  <p className="mt-1.5 text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                    // Tu próximo rival está en la ZMM
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-3xl leading-none text-primary">{formatCount(ZMM_TOTAL)}</p>
                  <p className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mt-1">
                    activos · ZMM
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-3 gap-3">
                <div>
                  <p className="font-display text-xl leading-none">{zmmMunicipios.length}</p>
                  <p className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mt-1">municipios</p>
                </div>
                <div>
                  <p className="font-display text-xl leading-none">{formatCount(totalInScope)}</p>
                  <p className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mt-1">
                    {sportFilter === "todos" ? "en tu deporte" : sportFilter}
                  </p>
                </div>
                <div>
                  <p className="font-display text-xl leading-none text-primary">{players.filter((p) => p.online).length}</p>
                  <p className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mt-1">en línea</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 px-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar jugador o municipio..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* Sport filter chips */}
        <div className="mt-3 px-4 flex gap-2 overflow-x-auto no-scrollbar">
          {sportOptions.map((s) => {
            const active = sportFilter === s;
            return (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`flex-shrink-0 h-8 px-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono border transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary glow-green scale-105"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Location selector */}
        <div className="mt-3 px-4">
          <button
            onClick={() => { setCitySearch(""); setCityOpen(true); }}
            className="group w-full flex items-center gap-3 h-14 px-3 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all text-left"
          >
            <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/15 text-primary shrink-0 group-hover:bg-primary/25 transition-colors">
              <MapPin size={17} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[9px] uppercase tracking-widest font-mono text-muted-foreground leading-none">
                Municipio
              </span>
              <span className="block text-sm font-semibold truncate mt-1">
                {cityFilter === "todas" ? "Todos los municipios" : cityFilter}
              </span>
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground shrink-0 px-2 py-1 rounded-full bg-secondary/60">
              <span className="font-bold text-foreground">
                {formatCount(cityFilter === "todas" ? totalInScope : (cityOptions.find((c) => c.name === cityFilter)?.count ?? 0))}
              </span>
              <span>jug.</span>
            </span>
            {cityFilter !== "todas" && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); setCityFilter("todas"); }}
                className="flex items-center justify-center h-7 w-7 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 shrink-0"
                aria-label="Limpiar municipio"
              >
                <X size={12} />
              </span>
            )}
          </button>
        </div>

        <Sheet open={cityOpen} onOpenChange={setCityOpen}>
          <SheetContent side="bottom" className="bg-card border-border rounded-t-3xl p-0 max-h-[80vh] flex flex-col">
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border" />
            <SheetHeader className="px-5 pt-3 pb-3 text-left">
              <SheetTitle className="font-display text-2xl leading-none">MUNICIPIO</SheetTitle>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                // Filtra jugadores por municipio
              </p>
            </SheetHeader>
            <div className="px-5 pb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Buscar municipio..."
                  className="w-full h-10 pl-9 pr-3 rounded-full bg-background border border-border text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-5">
              <button
                onClick={() => { setCityFilter("todas"); setCityOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  cityFilter === "todas" ? "bg-primary/10 text-primary" : "hover:bg-secondary/60"
                }`}
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-secondary text-foreground shrink-0">
                  <MapPin size={14} />
                </span>
                <span className="flex-1 text-left text-sm font-semibold">Todos los municipios</span>
                <span className="text-[10px] font-mono text-muted-foreground">{formatCount(totalInScope)}</span>
                {cityFilter === "todas" && <Check size={14} className="text-primary" />}
              </button>
              <div className="my-2 h-px bg-border" />
              {filteredCityOptions.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">Sin resultados</p>
              ) : (
                filteredCityOptions.map((c) => {
                  const active = cityFilter === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => { setCityFilter(c.name); setCityOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                        active ? "bg-primary/10 text-primary" : "hover:bg-secondary/60"
                      }`}
                    >
                      <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-secondary text-foreground shrink-0">
                        <MapPin size={14} />
                      </span>
                      <span className="flex-1 text-left text-sm font-semibold truncate">{c.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{formatCount(c.count)}</span>
                      {active && <Check size={14} className="text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </SheetContent>
        </Sheet>

        {filtered.length === 0 ? (
          <div className="mx-4 mt-5 rounded-2xl border border-dashed border-border p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary/60 flex items-center justify-center mb-3">
              <Search size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">Sin resultados</p>
            <p className="text-xs text-muted-foreground mt-1">
              Prueba con otro deporte o municipio.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 px-4">
            {filtered.map((p) => {
              const conn = connByPlayer[p.id];
              const status = conn?.status;
              return (
                <div
                  key={p.id}
                  className="group relative rounded-2xl border border-border bg-card p-4 hover:border-primary/60 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] transition-all overflow-hidden"
                >
                  {/* subtle gradient on hover */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-primary/5 to-transparent" />

                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative">
                      <div className={`p-0.5 rounded-full ${p.online ? "bg-gradient-to-br from-primary to-primary/40" : "bg-border"}`}>
                        <div className="rounded-full bg-card p-0.5">
                          <Avatar seed={p.avatar_seed} size={60} name={p.display_name} />
                        </div>
                      </div>
                      {p.online && (
                        <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-card glow-green" />
                      )}
                    </div>

                    <h3 className="font-display text-lg leading-none mt-3 truncate w-full">{p.display_name}</h3>

                    <div className="flex items-center gap-1 mt-1.5 text-[10px] font-mono text-muted-foreground truncate w-full justify-center">
                      <MapPin size={10} className="text-primary/70 shrink-0" />
                      <span className="truncate">{p.colonia}</span>
                      <span className="text-border">·</span>
                      <span>{p.distance_km}km</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10">
                        <Star size={10} className="text-primary fill-primary" />
                        <span className="text-[10px] font-bold font-mono text-primary">{p.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 mt-2 flex-wrap justify-center min-h-[18px]">
                      {p.sports.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest font-mono border"
                          style={{ color: sportColors[s] || "#fff", borderColor: `${sportColors[s] || "#fff"}55`, background: `${sportColors[s] || "#fff"}10` }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-3 space-y-1.5">
                    {status === "accepted" ? (
                      <button
                        onClick={() => navigate(`/chat/${conn!.id}`)}
                        className="w-full h-9 rounded-full border border-primary text-primary font-bold uppercase tracking-widest text-[10px] font-mono flex items-center justify-center gap-1 hover:bg-primary/10 transition-all"
                      >
                        <MessageCircle size={12} /> Chatear
                      </button>
                    ) : status === "pending" ? (
                      <button disabled className="w-full h-9 rounded-full bg-secondary text-muted-foreground font-bold uppercase tracking-widest text-[10px] font-mono flex items-center justify-center gap-1 cursor-not-allowed">
                        <Check size={12} /> Enviada
                      </button>
                    ) : (
                      <button
                        onClick={() => connect(p)}
                        className="w-full h-9 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] font-mono glow-green hover:brightness-110 flex items-center justify-center gap-1 transition-all"
                      >
                        <Zap size={12} className="fill-primary-foreground" /> Conectar
                      </button>
                    )}
                    <button className="w-full h-8 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 font-bold uppercase tracking-widest text-[10px] font-mono flex items-center justify-center gap-1 transition-colors">
                      Ver perfil <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section C: Connections */}
      <section className="px-4 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl leading-none">MIS CONEXIONES</h2>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              // Tu red en PlayOn
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground px-2 py-1 rounded-full bg-secondary/60">
            {(acceptedPlayers.length || Math.min(5, players.length))} activos
          </span>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {(() => {
            const list = acceptedPlayers.length > 0
              ? acceptedPlayers
              : players.slice(0, 5).map((p) => ({ conn: { id: `demo-${p.id}`, last_played: "Hoy" } as any, player: p }));
            return list.map(({ conn, player }) => {
              const last = lastMsgs[conn.id];
              const u = unread[conn.id] || 0;
              const isReal = acceptedPlayers.length > 0;
              return (
                <div key={conn.id} className="flex items-center gap-3 p-3.5 hover:bg-secondary/30 transition-colors">
                  <div className="relative shrink-0">
                    <Avatar seed={player.avatar_seed} size={48} name={player.display_name} />
                    {player.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card glow-green" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{player.display_name}</p>
                      {u > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary glow-green shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <MapPin size={10} className="text-primary/60 shrink-0" />
                      {player.colonia} · {conn.last_played || "—"}
                    </p>
                    {last && (
                      <p className={`text-[12px] truncate mt-0.5 ${u > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {last.body}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => isReal ? navigate(`/chat/${conn.id}`) : connect(player)}
                    className="relative h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0"
                    aria-label="Chat"
                  >
                    <MessageCircle size={15} />
                    {u > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold font-mono flex items-center justify-center glow-green">
                        {u}
                      </span>
                    )}
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </section>

      <AlertDialog open={!!confirmPlayer} onOpenChange={(o) => !o && setConfirmPlayer(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl">
              CONECTAR CON {confirmPlayer?.display_name?.toUpperCase()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Le enviaremos una solicitud para conectar contigo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={sendRequest} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Enviar solicitud
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
