import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, DollarSign, Check, X, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Court { id: string; name: string; price_per_hour: number }
interface Booking {
  id: string; court_id: string; user_id: string; starts_at: string; duration_minutes: number;
  total_price: number; status: string;
  display_name: string | null;
  courts: { name: string } | null;
}

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data: cs } = await supabase.from("courts").select("id, name, price_per_hour").eq("owner_id", user.id);
    setCourts((cs as Court[]) ?? []);
    const ids = (cs ?? []).map((c) => c.id);
    if (ids.length) {
      const { data: bs } = await supabase.from("bookings")
        .select("*, courts(name)")
        .in("court_id", ids).order("starts_at", { ascending: true });
      const userIds = Array.from(new Set((bs ?? []).map((b: any) => b.user_id)));
      const { data: profs } = userIds.length
        ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
        : { data: [] as any[] };
      const nameById = new Map((profs ?? []).map((p: any) => [p.id, p.display_name]));
      setBookings(((bs as any) ?? []).map((b: any) => ({ ...b, display_name: nameById.get(b.user_id) ?? null })));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    toast({ title: `Reserva ${status === "confirmed" ? "confirmada" : "rechazada"}` });
    load();
  };

  const monthRevenue = bookings
    .filter((b) => b.status === "confirmed" && new Date(b.starts_at).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + Number(b.total_price), 0);

  if (loading) return <AppShell><div className="p-10 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div></AppShell>;

  return (
    <AppShell subtitle="Dueño · Dashboard">
      <div className="px-4 pt-3 flex items-center gap-3">
        <Link to="/profile" className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Dueño</p>
          <h1 className="font-display text-3xl leading-none">DASHBOARD</h1>
        </div>
      </div>

      {courts.length === 0 ? (
        <section className="px-4 mt-8">
          <div className="rounded border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Aún no eres dueño de ninguna cancha.</p>
            <p className="text-xs text-muted-foreground mt-2">Próximamente: registra tu cancha desde la app.</p>
          </div>
        </section>
      ) : (
        <>
          <section className="px-4 mt-5">
            <div className="relative overflow-hidden rounded border border-primary/40 bg-card p-5">
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
                  <DollarSign size={12} /> Ingresos del mes (confirmadas)
                </p>
                <p className="font-display text-6xl text-primary leading-none mt-2 text-glow">${monthRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-mono mt-2">{courts.length} {courts.length === 1 ? "cancha" : "canchas"} activas</p>
              </div>
            </div>
          </section>

          <section className="px-4 mt-6">
            <h2 className="font-display text-xl leading-none mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-primary" /> Reservas
            </h2>
            {bookings.length === 0 ? (
              <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Aún no hay reservas.
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => {
                  const d = new Date(b.starts_at);
                  const dStr = d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
                  const tStr = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={b.id} className="rounded border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{b.profiles?.display_name ?? "Jugador"}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{b.courts?.name} · {dStr} {tStr} · {b.duration_minutes}min</p>
                        </div>
                        <span className="font-mono text-sm text-primary">${b.total_price}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-1 rounded ${
                          b.status === "confirmed" ? "bg-primary/15 text-primary" :
                          b.status === "rejected" ? "bg-destructive/15 text-destructive" :
                          "bg-muted text-muted-foreground"
                        }`}>{b.status}</span>
                        {b.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => setStatus(b.id, "rejected")} className="h-8 px-2 rounded border border-destructive/40 text-destructive text-xs flex items-center gap-1">
                              <X size={12} /> Rechazar
                            </button>
                            <button onClick={() => setStatus(b.id, "confirmed")} className="h-8 px-2 rounded bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                              <Check size={12} /> Confirmar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
      <div className="h-8" />
    </AppShell>
  );
};

export default OwnerDashboard;
