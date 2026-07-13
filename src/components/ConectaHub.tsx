import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, MessageCircle, Search, UserPlus, Users, X } from "lucide-react";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { DiscoveryProfile, areaLabel, formatSport } from "@/lib/playerDiscovery";

type ConnStatus = "pending" | "accepted" | "rejected";

interface ConnectionRow {
  id: string;
  user_a: string;
  user_b: string;
  requested_by: string;
  status: ConnStatus;
  created_at: string;
}

interface ConnectionWithPlayer {
  conn: ConnectionRow;
  player: DiscoveryProfile;
}

export const ConectaHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);

  const loadConnections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: conns } = await supabase
      .from("connections")
      .select("id, user_a, user_b, requested_by, status, created_at")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const rows = (conns as ConnectionRow[]) ?? [];
    const otherIds = Array.from(new Set(rows.map((conn) => (conn.user_a === user.id ? conn.user_b : conn.user_a))));
    const { data: players } = otherIds.length
      ? await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, municipio, broad_area, sports, skill_level, availability, online")
          .in("id", otherIds)
      : { data: [] };

    setConnections(rows);
    setProfiles((players as DiscoveryProfile[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadConnections();
  }, [loadConnections]);

  const byPlayer = useMemo(() => {
    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
    const rows: ConnectionWithPlayer[] = [];
    if (!user) return rows;
    for (const conn of connections) {
      const otherId = conn.user_a === user.id ? conn.user_b : conn.user_a;
      const player = profileMap.get(otherId);
      if (player) rows.push({ conn, player });
    }
    return rows;
  }, [connections, profiles, user]);

  const pendingIncoming = byPlayer.filter(({ conn }) => conn.status === "pending" && conn.requested_by !== user?.id);
  const pendingOutgoing = byPlayer.filter(({ conn }) => conn.status === "pending" && conn.requested_by === user?.id);
  const accepted = byPlayer.filter(({ conn }) => conn.status === "accepted");

  const updateConnection = async (conn: ConnectionRow, status: ConnStatus, title: string) => {
    const { error } = await supabase.from("connections").update({ status }).eq("id", conn.id);
    if (error) {
      toast({ title: "No se pudo actualizar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title });
    await loadConnections();
  };

  const deleteConnection = async (conn: ConnectionRow, title: string) => {
    const { error } = await supabase.from("connections").delete().eq("id", conn.id);
    if (error) {
      toast({ title: "No se pudo actualizar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title });
    await loadConnections();
  };

  if (!user) {
    return (
      <div className="px-4 mt-8">
        <div className="rounded border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">Inicia sesion para conectar con jugadores cerca de ti.</p>
          <button onClick={() => navigate("/login")} className="h-10 px-4 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs glow-green">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-6 pb-8 space-y-6">
      <section className="rounded border border-primary/40 bg-card p-5 overflow-hidden relative">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-mono">Sprint 2</p>
              <h2 className="font-display text-3xl leading-none mt-1">FIND PLAYERS</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Encuentra gente con deportes, nivel, zona y disponibilidad compatibles.
              </p>
            </div>
            <div className="h-11 w-11 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Search size={20} />
            </div>
          </div>
          <button
            onClick={() => navigate("/players")}
            className="mt-5 h-11 w-full rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs font-mono glow-green flex items-center justify-center gap-2"
          >
            <UserPlus size={15} /> Encontrar jugadores
          </button>
        </div>
      </section>

      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          <ConnectionSection
            title="Solicitudes recibidas"
            empty="No tienes solicitudes pendientes."
            rows={pendingIncoming}
            renderAction={({ conn }) => (
              <div className="flex gap-2">
                <button onClick={() => updateConnection(conn, "accepted", "+50 XP - Conexion aceptada")} className="h-9 px-3 rounded bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-1">
                  <Check size={12} /> Aceptar
                </button>
                <button onClick={() => updateConnection(conn, "rejected", "Solicitud rechazada")} className="h-9 px-3 rounded border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-widest font-mono">
                  Rechazar
                </button>
              </div>
            )}
          />

          <ConnectionSection
            title="Mis conexiones"
            empty="Aun no tienes conexiones aceptadas."
            rows={accepted}
            renderAction={({ conn }) => (
              <div className="flex gap-2">
                <button onClick={() => navigate(`/chat/${conn.id}`)} className="h-9 w-9 rounded border border-primary text-primary flex items-center justify-center" aria-label="Chat">
                  <MessageCircle size={14} />
                </button>
                <button onClick={() => deleteConnection(conn, "Conexion eliminada")} className="h-9 w-9 rounded border border-border text-muted-foreground flex items-center justify-center" aria-label="Eliminar conexion">
                  <X size={14} />
                </button>
              </div>
            )}
          />

          <ConnectionSection
            title="Solicitudes enviadas"
            empty="No tienes solicitudes enviadas pendientes."
            rows={pendingOutgoing}
            renderAction={({ conn }) => (
              <button onClick={() => deleteConnection(conn, "Solicitud cancelada")} className="h-9 px-3 rounded border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-widest font-mono">
                Cancelar
              </button>
            )}
          />
        </>
      )}
    </div>
  );
};

const ConnectionSection = ({
  title,
  empty,
  rows,
  renderAction,
}: {
  title: string;
  empty: string;
  rows: ConnectionWithPlayer[];
  renderAction: (row: ConnectionWithPlayer) => React.ReactNode;
}) => (
  <section>
    <div className="flex items-center justify-between">
      <h3 className="font-display text-2xl leading-none">{title}</h3>
      <span className="text-[10px] font-mono text-muted-foreground px-2 py-1 rounded bg-secondary/60">{rows.length}</span>
    </div>
    <div className="mt-3 rounded border border-border bg-card divide-y divide-border overflow-hidden">
      {rows.length ? rows.map((row) => (
        <div key={row.conn.id} className="p-3 flex items-center gap-3">
          <Link to={`/players/${row.player.id}`} className="text-left flex items-center gap-3 min-w-0 flex-1">
            <InitialsAvatar name={row.player.display_name} avatarPath={row.player.avatar_url} size={42} />
            <span className="min-w-0">
              <span className="block text-sm font-semibold truncate">{row.player.display_name}</span>
              <span className="block text-[11px] text-muted-foreground truncate">
                {areaLabel(row.player)} · {(row.player.sports ?? []).slice(0, 2).map(formatSport).join(", ") || "Sin deportes"}
              </span>
            </span>
          </Link>
          {renderAction(row)}
        </div>
      )) : (
        <div className="p-5 text-center">
          <Users className="mx-auto text-muted-foreground" size={22} />
          <p className="mt-2 text-xs text-muted-foreground">{empty}</p>
        </div>
      )}
    </div>
  </section>
);
