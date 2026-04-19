import { NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, MapPin, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/matches", label: "Partidos", icon: Calendar },
  { to: "/courts", label: "Canchas", icon: MapPin },
  { to: "/community", label: "Comunidad", icon: Users },
  { to: "/profile", label: "Perfil", icon: User },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-border"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-screen-md items-stretch justify-between px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 rounded-md transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={cn(active && "drop-shadow-[0_0_6px_hsl(var(--primary))]")}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
