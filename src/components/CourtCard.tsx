import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Court } from "@/data/mock";
import { SportBadge } from "./SportBadge";

export const CourtCard = ({
  court,
  variant = "horizontal",
}: {
  court: Court;
  variant?: "horizontal" | "vertical";
}) => {
  if (variant === "horizontal") {
    return (
      <Link
        to={`/courts/${court.id}`}
        className="group flex-shrink-0 w-64 rounded bg-card border border-border overflow-hidden shadow-card hover:border-primary/50 transition-all"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={court.image}
            alt={court.name}
            loading="lazy"
            width={1280}
            height={896}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2"><SportBadge sport={court.sport} /></div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-sm bg-background/80 backdrop-blur text-xs font-mono">
            <span className="text-primary">${court.pricePerHour}</span>
            <span className="text-muted-foreground">/hr</span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-display text-xl leading-tight">{court.name}</h3>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {court.neighborhood} · {court.distanceKm} km
            </span>
            <span className="flex items-center gap-0.5 text-foreground">
              <Star size={12} className="fill-primary text-primary" />
              {court.rating}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/courts/${court.id}`}
      className="group flex gap-3 rounded bg-card border border-border overflow-hidden p-2 hover:border-primary/50 transition-colors"
    >
      <img
        src={court.image}
        alt={court.name}
        loading="lazy"
        width={1280}
        height={896}
        className="h-24 w-32 object-cover rounded-sm flex-shrink-0"
      />
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight truncate">{court.name}</h3>
          <SportBadge sport={court.sport} />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin size={11} /> {court.neighborhood}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs">
            <Star size={12} className="fill-primary text-primary" />
            <span className="text-foreground font-semibold">{court.rating}</span>
            <span className="text-muted-foreground">({court.reviewCount})</span>
          </span>
          <span className="font-mono text-sm">
            <span className="text-primary">${court.pricePerHour}</span>
            <span className="text-muted-foreground">/hr</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
