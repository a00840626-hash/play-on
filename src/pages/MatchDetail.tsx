import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Clock, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SportBadge } from "@/components/SportBadge";
import { openMatches, courts } from "@/data/mock";
import { toast } from "sonner";

const MatchDetail = () => {
  const { id } = useParams();
  const match = openMatches.find((m) => m.id === id);
  const court = match ? courts.find((c) => c.id === match.courtId) : null;

  if (!match || !court) {
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground">
          Partido no encontrado. <Link to="/" className="text-primary">Volver</Link>
        </div>
      </AppShell>
    );
  }

  const spotsLeft = match.max - match.current;

  return (
    <AppShell subtitle="Partido abierto">
      <div className="relative">
        <img src={court.image} alt={court.name} width={1280} height={896} className="w-full aspect-[16/9] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Link to="/" className="absolute top-3 left-3 h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border">
          <ArrowLeft size={18} />
        </Link>
        <div className="absolute bottom-4 left-4 right-4">
          <SportBadge sport={match.sport} />
          <h1 className="font-display text-3xl mt-2 leading-none">
            {match.date} · <span className="text-primary">{match.time}</span>
          </h1>
        </div>
      </div>

      <section className="px-4 mt-5 grid grid-cols-2 gap-3">
        <Stat label="Jugadores" value={`${match.current}/${match.max}`} accent />
        <Stat label="Lugares libres" value={String(spotsLeft)} />
        <Stat label="Nivel" value={match.skill} mono />
        <Stat label="Por jugador" value={`$${match.pricePerPlayer}`} accent />
      </section>

      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3">Cancha</h2>
        <Link to={`/courts/${court.id}`} className="flex items-center gap-3 rounded border border-border bg-card p-3 hover:border-primary/50 transition-colors">
          <img src={court.image} alt={court.name} width={1280} height={896} className="h-16 w-20 object-cover rounded-sm" />
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg leading-tight">{court.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {court.neighborhood}
            </p>
          </div>
          <Clock size={18} className="text-primary" />
        </Link>
      </section>

      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3">Anfitrión</h2>
        <div className="flex items-center gap-3 rounded border border-border bg-card p-3">
          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-display text-xl">
            {match.hostName[0]}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{match.hostName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Star size={11} className="fill-primary text-primary" /> {match.hostRating} · 28 partidos
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3 flex items-center gap-2">
          <MessageCircle size={18} className="text-primary" /> Chat del grupo
        </h2>
        <div className="rounded border border-border bg-card p-4 space-y-2">
          <ChatBubble who="Diego R." text="¡Vamos por la victoria! 💪" />
          <ChatBubble who="Luis M." text="Yo llevo el balón." mine={false} />
        </div>
      </section>

      <div className="fixed bottom-[72px] inset-x-0 z-40 px-4 py-3 border-t border-border backdrop-blur-md bg-background/85">
        <div className="mx-auto max-w-screen-md">
          <button
            onClick={() => toast.success("¡Te uniste al partido!", { description: `${match.courtName} · ${match.time}` })}
            className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm glow-green hover:glow-green-strong transition-all active:scale-[0.98]"
          >
            Unirme al partido — ${match.pricePerPlayer}
          </button>
        </div>
      </div>
    </AppShell>
  );
};

const Stat = ({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) => (
  <div className="rounded border border-border bg-card p-3">
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</p>
    <p className={`mt-1 font-display text-2xl leading-none ${accent ? "text-primary" : "text-foreground"} ${mono ? "capitalize" : ""}`}>
      {value}
    </p>
  </div>
);

const ChatBubble = ({ who, text, mine = true }: { who: string; text: string; mine?: boolean }) => (
  <div className={`flex ${mine ? "justify-start" : "justify-end"}`}>
    <div className={`max-w-[80%] rounded-sm px-3 py-2 text-sm ${mine ? "bg-secondary" : "bg-primary/15 border border-primary/30"}`}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{who}</p>
      <p>{text}</p>
    </div>
  </div>
);

export default MatchDetail;
