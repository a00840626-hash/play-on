import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Loader2, Building2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Court {
  id: string; name: string; sport: string; address: string; municipio: string | null;
  price_per_hour: number; amenities: string[]; description: string | null;
}

const SPORT_ICON: Record<string, string> = {
  futbol: "⚽", tenis: "🎾", padel: "🎾", basquetbol: "🏀", pickleball: "🥒", voleibol: "🏐",
};

const CourtDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState(60);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("courts").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setCourt(data as Court); setLoading(false);
    });
  }, [id]);

  const book = async () => {
    if (!user || !court) return;
    if (!date) { toast({ title: "Elige fecha", variant: "destructive" }); return; }
    setBooking(true);
    const starts_at = new Date(`${date}T${time}`).toISOString();
    const total = court.price_per_hour * (duration / 60);
    const { error } = await supabase.from("bookings").insert({
      court_id: court.id, user_id: user.id, starts_at, duration_minutes: duration,
      total_price: total, status: "pending", payment_method: "on_site",
    });
    setBooking(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "¡Reserva creada!", description: `Pago en sitio: $${total}` });
  };

  if (loading) return <AppShell><div className="p-10 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div></AppShell>;
  if (!court) return <AppShell><div className="p-8 text-center text-muted-foreground">Cancha no encontrada. <Link to="/courts" className="text-primary">Volver</Link></div></AppShell>;

  const total = court.price_per_hour * (duration / 60);

  return (
    <AppShell subtitle={court.municipio ?? court.name}>
      <div className="px-4 pt-3">
        <Link to="/courts" className="inline-flex h-10 w-10 rounded-full bg-card border border-border items-center justify-center">
          <ArrowLeft size={18} />
        </Link>
      </div>

      <section className="px-4 mt-4">
        <div className="flex items-start gap-3">
          <div className="h-16 w-16 rounded bg-primary/10 border border-primary/40 flex items-center justify-center text-3xl">
            {SPORT_ICON[court.sport] ?? "🏟️"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest font-mono text-primary">{court.sport}</p>
            <h1 className="font-display text-3xl leading-tight mt-1">{court.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin size={11} /> {court.address}</p>
          </div>
        </div>
      </section>

      {court.description && (
        <section className="px-4 mt-5">
          <p className="text-sm text-muted-foreground">{court.description}</p>
        </section>
      )}

      <section className="px-4 mt-6">
        <h2 className="font-display text-xl leading-none mb-3">Amenidades</h2>
        <div className="flex flex-wrap gap-2">
          {court.amenities.map((a) => (
            <span key={a} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-sm bg-card border border-border text-xs">
              <Building2 size={14} className="text-primary" /> {a}
            </span>
          ))}
        </div>
      </section>

      <section className="px-4 mt-6 pb-32">
        <h2 className="font-display text-xl leading-none mb-3">Reservar</h2>
        <div className="space-y-3 rounded border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha"><input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-3 rounded bg-background border border-border focus:border-primary focus:outline-none text-sm font-mono" /></Field>
            <Field label="Hora"><input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full h-11 px-3 rounded bg-background border border-border focus:border-primary focus:outline-none text-sm font-mono" /></Field>
          </div>
          <Field label="Duración (min)">
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-11 px-3 rounded bg-background border border-border focus:border-primary focus:outline-none text-sm">
              {[60, 90, 120, 180].map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </Field>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground">Total a pagar en sitio</span>
            <span className="font-display text-2xl text-primary">${total}</span>
          </div>
        </div>
      </section>

      <div className="fixed bottom-[72px] inset-x-0 z-40 px-4 py-3 border-t border-border backdrop-blur-md bg-background/85">
        <div className="mx-auto max-w-screen-md">
          <button onClick={book} disabled={booking}
            className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm glow-green hover:brightness-110 disabled:opacity-50">
            {booking ? "..." : `Reservar — $${total}`}
          </button>
          <p className="text-[10px] text-center font-mono text-muted-foreground mt-1.5">El pago se realiza en sitio</p>
        </div>
      </div>
    </AppShell>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1.5">{label}</span>
    {children}
  </label>
);

export default CourtDetail;
