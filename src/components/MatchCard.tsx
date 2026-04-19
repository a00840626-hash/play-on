import { Link } from "react-router-dom";
import { Clock, Users, Zap } from "lucide-react";
import { OpenMatch } from "@/data/mock";
import { SportBadge } from "./SportBadge";

const skillColor: Record<string, string> = {
  principiante: "text-primary",
  intermedio: "text-primary",
  avanzado: "text-accent",
};

export const MatchCard = ({ match }: { match: OpenMatch }) => {
  const spotsLeft = match.max - match.current;
  const fillPct = (match.current / match.max) * 100;

  return (
    <Link
      to={`/matches/${match.id}`}
      className="block rounded bg-card border border-border p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <SportBadge sport={match.sport} />
            <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${skillColor[match.skill]}`}>
              · {match.skill}
            </span>
          </div>
          <h3 className="font-display text-2xl leading-tight mt-1.5">
            {match.courtName}
          </h3>
          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {match.date} · {match.time}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl text-primary leading-none text-glow">
            ${match.pricePerPlayer}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
            por jugador
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users size={12} /> {match.current}/{match.max} jugadores
            </span>
            <span className="text-primary font-semibold">
              {spotsLeft > 0 ? `${spotsLeft} lugares` : "Lleno"}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-primary"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-primary">
          <Zap size={16} fill="currentColor" />
        </div>
      </div>
    </Link>
  );
};
