import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, LogOut, ChevronRight, BarChart3, Edit2, Trash2, Loader2, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SPORT_LABEL: Record<string, string> = {
  futbol: "Fútbol", tenis: "Tenis", padel: "Pádel", basquetbol: "Básquet",
  pickleball: "Pickleball", voleibol: "Voleibol", running: "Running",
};
const SPORT_ICON: Record<string, string> = {
  futbol: "⚽", tenis: "🎾", padel: "🎾", basquetbol: "🏀",
  pickleball: "🥒", voleibol: "🏐", running: "🏃",
};
const LEVEL_LABEL: Record<string, string> = {
  principiante: "Principiante", intermedio: "Intermedio", avanzado: "Avanzado",
};

interface ProfileData {
  display_name: string | null;
  municipio: string | null;
  skill_level: string | null;
  sports: string[] | null;
  bio: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [matchesCount, setMatchesCount] = useState(0);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, { count: mc }, { count: cc }] = await Promise.all([
        supabase.from("profiles").select("display_name, municipio, skill_level, sports, bio, avatar_url").eq("id", user.id).maybeSingle(),
        supabase.from("match_participants").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("connections").select("id", { count: "exact", head: true }).or(`user_a.eq.${user.id},user_b.eq.${user.id}`).eq("status", "accepted"),
      ]);
      setProfile(prof);
      setMatchesCount(mc ?? 0);
      setConnectionsCount(cc ?? 0);
      setLoading(false);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete profile row first (cascades wipe most user data via FK constraints)
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      toast({ title: "Cuenta eliminada", description: "Lamentamos verte ir." });
      navigate("/login");
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "No se pudo eliminar", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <AppShell><div className="p-10 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div></AppShell>;
  }

  const name = profile?.display_name || user?.email?.split("@")[0] || "Jugador";
  const sports = profile?.sports ?? [];

  return (
    <AppShell subtitle="PERFIL">
      <section className="relative px-5 pt-6 pb-7 overflow-hidden"
        style={{ background: "linear-gradient(180deg, hsl(150 60% 6%) 0%, hsl(var(--background)) 100%)" }}>
        <div className="absolute inset-0 field-grid opacity-60 pointer-events-none" />
        <div className="relative flex flex-col items-center">
          <InitialsAvatar name={name} avatarPath={profile?.avatar_url} size={120} />
          <h1 className="font-display text-foreground text-center mt-4" style={{ fontSize: 30, letterSpacing: "0.04em", lineHeight: 1 }}>
            {name.toUpperCase()}
          </h1>
          <p className="font-body text-muted-foreground text-[13px] mt-2">
            {profile?.municipio ? `${profile.municipio}, NL` : "Monterrey"}
          </p>
          {profile?.skill_level && (
            <div className="mt-3 inline-flex items-center rounded-full px-3 py-1.5"
              style={{ backgroundColor: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary))" }}>
              <span className="font-condensed font-bold text-[11px] uppercase text-primary" style={{ letterSpacing: "0.2em" }}>
                ◉ {LEVEL_LABEL[profile.skill_level]}
              </span>
            </div>
          )}
          {profile?.bio && <p className="text-sm text-muted-foreground text-center mt-4 max-w-xs">{profile.bio}</p>}

          <div className="flex items-stretch w-full mt-6">
            {[
              { v: String(matchesCount), l: "Partidos" },
              { v: String(sports.length), l: "Deportes" },
              { v: String(connectionsCount), l: "Amigos" },
            ].map((s, i, arr) => (
              <div key={s.l} className={`flex-1 flex flex-col items-center text-center ${i < arr.length - 1 ? "border-r border-border" : ""}`}>
                <div className="font-display text-primary leading-none" style={{ fontSize: 36 }}>{s.v}</div>
                <div className="font-condensed text-[10px] uppercase text-muted-foreground mt-1.5" style={{ letterSpacing: "0.15em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {sports.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="font-display text-2xl leading-none">MIS DEPORTES</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {sports.map((s) => (
              <span key={s} className="inline-flex items-center gap-2 h-10 px-3 rounded-sm bg-card border border-border text-sm">
                <span>{SPORT_ICON[s] ?? "•"}</span>
                <span className="font-bold uppercase tracking-wider text-xs">{SPORT_LABEL[s] ?? s}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="px-4 mt-6">
        <Link to="/profile/edit" className="flex items-center justify-between rounded border border-primary/40 bg-card p-4 hover:bg-primary/5 transition-colors">
          <div className="flex items-center gap-3">
            <Edit2 size={20} className="text-primary" />
            <p className="font-display text-lg leading-none">EDITAR PERFIL</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
      </section>

      <section className="px-4 mt-3">
        <Link to="/owner" className="flex items-center justify-between rounded border border-border bg-card p-4 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-primary" />
            <div>
              <p className="font-display text-lg leading-none">DASHBOARD DE CANCHA</p>
              <p className="text-xs text-muted-foreground mt-0.5">Vista para dueños</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
      </section>

      <section className="px-4 mt-5 mb-8 space-y-2">
        <Link to="/privacy" className="block">
          <SettingsRow icon={Settings} label="Política de privacidad" />
        </Link>
        <Link to="/terms" className="block">
          <SettingsRow icon={Settings} label="Términos de servicio" />
        </Link>
        <button type="button" onClick={handleSignOut} className="w-full">
          <SettingsRow icon={LogOut} label="Cerrar sesión" />
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className="w-full">
              <SettingsRow icon={Trash2} label="Eliminar cuenta" danger />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esto borrará permanentemente tu perfil, partidos, conexiones y mensajes. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </AppShell>
  );
};

const SettingsRow = ({ icon: Icon, label, danger }: { icon: LucideIcon; label: string; danger?: boolean }) => (
  <div className={`w-full flex items-center justify-between rounded border border-border bg-card p-3 hover:border-foreground/40 transition-colors ${danger ? "text-destructive" : ""}`}>
    <span className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm font-semibold">{label}</span>
    </span>
    <ChevronRight size={16} className="text-muted-foreground" />
  </div>
);

export default Profile;
