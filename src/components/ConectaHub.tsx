import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageCircle, Lock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { badgeCatalog, fmtBadgeDate } from "@/data/badges";
import { toast } from "@/hooks/use-toast";

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

const Avatar = ({ seed, size = 56 }: { seed: string; size?: number }) => (
  <img
    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=141414`}
    alt={seed}
    width={size}
    height={size}
    className="rounded-full bg-secondary"
    style={{ width: size, height: size }}
  />
);

export const ConectaHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [players, setPlayers] = useState<DemoPlayer[]>([]);
  const [conns, setConns] = useState<DemoConn[]>([]);
  const [lastMsgs, setLastMsgs] = useState<Record<string, LastMsg>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});

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

    // Auto-accept after delay (demo)
    setTimeout(async () => {
      await supabase.from("demo_connections").update({ status: "accepted", last_played: "Hoy" }).eq("id", data.id);
      // simulate first message from them
      await supabase.from("demo_messages").insert({
        connection_id: data.id,
        user_id: user.id,
        sender: "them",
        body: `¡Hola! Vi que jugamos lo mismo. ¿Te late armar algo esta semana?`,
      });
    }, 2500);
  };

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
        <div className="px-4 flex items-end justify-between">
          <h2 className="font-display text-2xl leading-none">JUGADORES CERCA DE TI</h2>
          <button className="text-[10px] uppercase tracking-widest font-mono text-primary hover:text-glow">Ver todos →</button>
        </div>
        <p className="px-4 mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          // Mismo deporte · misma colonia · mismo nivel
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 px-4">
          {players.map((p) => {
            const conn = connByPlayer[p.id];
            const status = conn?.status;
            return (
              <div
                key={p.id}
                className="rounded-md border border-border bg-card p-4 hover:border-primary transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar seed={p.avatar_seed} size={56} />
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
                      className="w-full h-8 rounded-sm border border-primary text-primary font-bold uppercase tracking-widest text-[10px] font-mono flex items-center justify-center gap-1 hover:bg-primary/10"
                    >
                      <MessageCircle size={12} /> Chatear →
                    </button>
                  ) : status === "pending" ? (
                    <button disabled className="w-full h-8 rounded-sm bg-secondary text-muted-foreground font-bold uppercase tracking-widest text-[10px] font-mono flex items-center justify-center gap-1 cursor-not-allowed">
                      <Check size={12} /> Solicitud enviada
                    </button>
                  ) : (
                    <button
                      onClick={() => connect(p)}
                      className="w-full h-8 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] font-mono glow-green hover:brightness-110"
                    >
                      Conectar
                    </button>
                  )}
                  <button className="w-full h-8 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 font-bold uppercase tracking-widest text-[10px] font-mono">
                    Ver perfil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section B: Badges */}
      <section className="px-4">
        <h2 className="font-display text-2xl leading-none">TUS LOGROS</h2>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          // Hitos, rachas y retos completados
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {badgeCatalog.map((b) => {
            const Icon = b.icon;
            const locked = b.locked;
            return (
              <div
                key={b.key}
                className={`rounded-md border p-3 ${locked ? "bg-card/50 border-border/50 opacity-60" : "bg-card border-border"}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`h-9 w-9 rounded-sm flex items-center justify-center ${locked ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                    {locked ? <Lock size={16} /> : <Icon size={18} />}
                  </div>
                </div>
                <h3 className={`font-display text-base leading-tight mt-2 ${locked ? "text-muted-foreground" : ""}`}>{b.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{b.description}</p>
                <p className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mt-2">
                  {locked ? "// POR DESBLOQUEAR" : `// ${fmtBadgeDate(b.earnedAt!)}`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section C: Connections */}
      <section className="px-4 pb-6">
        <h2 className="font-display text-2xl leading-none">MIS CONEXIONES</h2>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          // Tu red en PlayOn
        </p>

        <div className="mt-3 rounded border border-border bg-card divide-y divide-border">
          {acceptedPlayers.length === 0 ? (
            <div className="p-5 text-center text-sm text-muted-foreground">
              Aún no tienes conexiones. Conecta con alguien arriba ↑
            </div>
          ) : (
            acceptedPlayers.map(({ conn, player }) => {
              const last = lastMsgs[conn.id];
              const u = unread[conn.id] || 0;
              return (
                <button
                  key={conn.id}
                  onClick={() => navigate(`/chat/${conn.id}`)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors text-left"
                >
                  <Avatar seed={player.avatar_seed} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{player.display_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {last ? last.body : `Jugaron juntos: ${conn.last_played || "—"}`}
                    </p>
                  </div>
                  {u > 0 && (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold font-mono flex items-center justify-center glow-green">
                      {u}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
