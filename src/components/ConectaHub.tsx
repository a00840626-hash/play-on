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
}

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
  const cityOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    players.forEach((p) => {
      if (!p.colonia) return;
      const base = players.filter((x) => sportFilter === "todos" || x.sports.includes(sportFilter));
      counts[p.colonia] = base.filter((x) => x.colonia === p.colonia).length;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [players, sportFilter]);
  const totalInScope = useMemo(
    () => players.filter((p) => sportFilter === "todos" || p.sports.includes(sportFilter)).length,
    [players, sportFilter]
  );
  const filteredCityOptions = useMemo(() => {
    const s = citySearch.trim().toLowerCase();
    return s ? cityOptions.filter((c) => c.name.toLowerCase().includes(s)) : cityOptions;
  }, [cityOptions, citySearch]);
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
    <div className="space-y-8">
      {/* Section A: Players nearby */}
      <section className="mt-6">
        <div className="px-4">
          <h2 className="font-display text-2xl leading-none">JUGADORES</h2>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            // Encuentra a tu próximo rival o compañero
          </p>
        </div>

        {/* Search */}
        <div className="mt-3 px-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar jugador o colonia..."
              className="w-full h-10 pl-9 pr-3 rounded-full bg-card border border-border text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
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
                className={`flex-shrink-0 h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary glow-green"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* City filter chips */}
        <div className="mt-2 px-4 flex gap-2 overflow-x-auto no-scrollbar">
          {cityOptions.map((c) => {
            const active = cityFilter === c;
            return (
              <button
                key={c}
                onClick={() => setCityFilter(c)}
                className={`flex-shrink-0 h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary glow-green"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mx-4 mt-4 rounded-md border border-dashed border-border p-6 text-center">
            <Search size={20} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              No hay jugadores cerca con tu deporte y nivel. Prueba expandiendo tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 px-4">
            {filtered.map((p) => {
              const conn = connByPlayer[p.id];
              const status = conn?.status;
              return (
                <div
                  key={p.id}
                  className="rounded-md border border-border bg-card p-4 hover:border-primary transition-colors"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <Avatar seed={p.avatar_seed} size={56} name={p.display_name} />
                      {p.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card glow-green" />}
                    </div>
                    <h3 className="font-display text-lg leading-none mt-2">{p.display_name}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate w-full">
                      {p.colonia} · {p.distance_km} km
                    </p>
                    <div className="flex gap-1 mt-2 flex-wrap justify-center">
                      {p.sports.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest font-mono border"
                          style={{ color: sportColors[s] || "#fff", borderColor: `${sportColors[s] || "#fff"}55` }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs font-mono">
                      <Star size={12} className="text-primary fill-primary" />
                      <span>{p.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {status === "accepted" ? (
                      <button
                        onClick={() => navigate(`/chat/${conn!.id}`)}
                        className="w-full h-8 rounded-full border border-primary text-primary font-bold uppercase tracking-widest text-[10px] font-mono flex items-center justify-center gap-1 hover:bg-primary/10 transition-all duration-200"
                      >
                        <MessageCircle size={12} /> Chatear →
                      </button>
                    ) : status === "pending" ? (
                      <button disabled className="w-full h-8 rounded-full bg-secondary text-muted-foreground font-bold uppercase tracking-widest text-[10px] font-mono flex items-center justify-center gap-1 cursor-not-allowed transition-all duration-200">
                        <Check size={12} /> Solicitud enviada
                      </button>
                    ) : (
                      <button
                        onClick={() => connect(p)}
                        className="w-full h-8 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] font-mono glow-green hover:brightness-110 flex items-center justify-center gap-1 transition-all duration-200"
                      >
                        <Zap size={12} className="fill-primary-foreground" /> Conectar
                      </button>
                    )}
                    <button className="w-full h-8 rounded-full border border-border text-foreground hover:border-primary/40 font-bold uppercase tracking-widest text-[10px] font-mono flex items-center justify-center gap-1">
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
      <section className="px-4 pb-6">
        <h2 className="font-display text-2xl leading-none">MIS CONEXIONES</h2>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          // Tu red en PlayOn
        </p>

        <div className="mt-3 rounded border border-border bg-card divide-y divide-border">
          {(() => {
            const list = acceptedPlayers.length > 0
              ? acceptedPlayers
              : players.slice(0, 5).map((p) => ({ conn: { id: `demo-${p.id}`, last_played: "Hoy" } as any, player: p }));
            return list.map(({ conn, player }) => {
              const last = lastMsgs[conn.id];
              const u = unread[conn.id] || 0;
              const isReal = acceptedPlayers.length > 0;
              return (
                <div key={conn.id} className="flex items-center gap-3 p-3">
                  <Avatar seed={player.avatar_seed} size={44} name={player.display_name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{player.display_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {player.colonia} · Última vez: {conn.last_played || "—"}
                    </p>
                    {last && (
                      <p className="text-[12px] text-muted-foreground truncate mt-0.5">{last.body}</p>
                    )}
                  </div>
                  <button
                    onClick={() => isReal ? navigate(`/chat/${conn.id}`) : connect(player)}
                    className="relative h-8 px-4 rounded-full border border-primary text-primary font-bold uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5 hover:bg-primary/10 transition-colors"
                  >
                    <MessageCircle size={12} /> Chat
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
