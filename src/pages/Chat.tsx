import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Paperclip, Send, Calendar, MapPin, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { InitialsAvatar } from "@/components/InitialsAvatar";

interface Msg {
  id: string;
  sender_id: string;
  body: string;
  sent_at: string;
}

interface Player {
  display_name: string;
  avatar_url: string | null;
  online: boolean | null;
}

const Chat = () => {
  const { connectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connectionId || !user) return;
    (async () => {
      const { data: conn } = await supabase
        .from("connections")
        .select("user_a, user_b, status")
        .eq("id", connectionId)
        .maybeSingle();

      if (!conn || conn.status !== "accepted" || (conn.user_a !== user.id && conn.user_b !== user.id)) {
        setBlocked(true);
        setReady(true);
        return;
      }

      if (conn) {
        const otherId = conn.user_a === user.id ? conn.user_b : conn.user_a;
        const { data: p } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, online")
          .eq("id", otherId)
          .maybeSingle();
        if (p) setPlayer(p as Player);
      }

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, body, sent_at")
        .eq("connection_id", connectionId)
        .order("sent_at");
      setMessages((msgs as Msg[]) || []);

      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("connection_id", connectionId)
        .neq("sender_id", user.id)
        .is("read_at", null);

      setReady(true);
    })();

    const ch = supabase
      .channel(`chat-${connectionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `connection_id=eq.${connectionId}` },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [connectionId, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (body: string) => {
    if (blocked || !body.trim() || !connectionId || !user) return;
    setText("");
    const { data } = await supabase
      .from("messages")
      .insert({ connection_id: connectionId, sender_id: user.id, body: body.trim() })
      .select("id, sender_id, body, sent_at")
      .single();
    if (data) setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data as Msg]));
  };

  const quickActions = [
    { icon: Calendar, label: "Invitar a partido", msg: "¿Te late armar un partido esta semana?" },
    { icon: MapPin, label: "Compartir cancha", msg: "Aquí tengo una cancha buena para jugar." },
    { icon: Zap, label: "Reto rápido", msg: "Reto rápido: 1v1 mañana. ¿Aceptas?" },
  ];

  return (
    <div className="min-h-full flex flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        {player && <InitialsAvatar name={player.display_name} avatarPath={player.avatar_url} size={36} />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-sm">{player?.display_name || (ready ? "Conexión" : "...")}</p>
          {player?.online && <p className="text-[10px] uppercase tracking-widest font-mono text-primary">EN LÍNEA</p>}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-xs text-muted-foreground font-mono mt-12">
            {blocked ? "// Mensajes disponibles solo con conexiones aceptadas" : "// Empieza la conversación"}
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {quickActions.map((q) => {
          const Icon = q.icon;
          return (
            <button
              key={q.label}
              onClick={() => send(q.msg)}
              disabled={blocked}
              className="flex-shrink-0 h-8 px-3 rounded-full border border-border bg-card text-[11px] font-bold uppercase tracking-widest font-mono text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center gap-1.5"
            >
              <Icon size={12} />
              {q.label}
            </button>
          );
        })}
      </div>

      <div className="border-t border-border bg-card/50 px-3 py-2 flex items-center gap-2">
        <button className="text-muted-foreground hover:text-foreground p-2" aria-label="Adjuntar">
          <Paperclip size={18} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(text);
          }}
          placeholder="Mensaje..."
          disabled={blocked}
          className="flex-1 h-10 px-3 rounded-full bg-background border border-border text-sm focus:outline-none focus:border-primary"
        />
        <button
          onClick={() => send(text)}
          disabled={blocked || !text.trim()}
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-green disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
