import { Link } from "react-router-dom";
import { User } from "lucide-react";

export const TopBar = ({ subtitle }: { subtitle?: string }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-screen-md flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-3xl leading-none text-foreground">
            PLAY<span className="text-primary text-glow">ON</span>
          </span>
          <span
            className="ml-1 inline-block h-2 w-2 rounded-full bg-primary animate-pulse-glow"
            aria-label="En línea"
          />
        </Link>
        {subtitle && (
          <span className="hidden sm:block text-xs uppercase tracking-widest text-muted-foreground font-mono">
            {subtitle}
          </span>
        )}
        <Link
          to="/profile"
          className="h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:border-primary transition-colors"
          aria-label="Perfil"
        >
          <User size={18} />
        </Link>
      </div>
    </header>
  );
};
