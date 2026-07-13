import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
  Edit2,
  Trash2,
  Loader2,
  Flame,
  Medal,
  Trophy,
  Users,
  Award,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { badgeCatalog, fmtBadgeDate } from "@/data/badges";
import {
  getLevelFromXp,
  getLevelProgressPercentage,
  getXpForCurrentLevel,
  getXpForNextLevel,
  getXpNeededForNextLevel,
} from "@/lib/progression";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SPORT_LABEL: Record<string, string> = {
  futbol: "Fútbol",
  tenis: "Tenis",
  padel: "Pádel",
  basquetbol: "Básquet",
  basketball: "Básquet",
  basket: "Básquet",
  pickleball: "Pickleball",
  voleibol: "Voleibol",
  volley: "Voleibol",
  running: "Running",
  tocho: "Tocho",
  americano: "F. Americano",
};

const SPORT_ICON: Record<string, string> = {
  futbol: "⚽",
  tenis: "🎾",
  padel: "🎾",
  basquetbol: "🏀",
  basketball: "🏀",
  basket: "🏀",
  pickleball: "•",
  voleibol: "🏐",
  volley: "🏐",
  running: "•",
  tocho: "•",
  americano: "•",
};

const LEVEL_LABEL: Record<string, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

interface ProfileData {
  display_name: string | null;
  municipio: string | null;
  skill_level: string | null;
  sports: string[] | null;
  bio: string | null;
  avatar_url: string | null;
}

interface ProgressData {
  overall_xp: number;
  overall_level: number;
  current_streak: number;
  longest_streak: number;
  games_played: number;
  sports_friends_made: number;
  badges_earned: number;
}

interface SportProgress {
  sport: string;
  skill_level: string | null;
  xp: number;
  level: number;
  games_played: number;
}

interface EarnedBadge {
  badge_key: string;
  earned_at: string | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [sportProgress, setSportProgress] = useState<SportProgress[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, { data: prog }, { data: sports }, { data: badges }, { count: mc }, { count: cc }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, municipio, skill_level, sports, bio, avatar_url")
            .eq("id", user.id)
            .maybeSingle(),
          supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
          supabase
            .from("user_sport_profiles")
            .select("sport, skill_level, xp, level, games_played")
            .eq("user_id", user.id)
            .order("xp", { ascending: false }),
          supabase.from("badges").select("badge_key, earned_at").eq("user_id", user.id).order("earned_at", { ascending: false }),
          supabase
            .from("match_participants")
            .select("id, matches!inner(status)", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("matches.status", "completed"),
          supabase
            .from("connections")
            .select("id", { count: "exact", head: true })
            .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
            .eq("status", "accepted"),
        ]);

      setProfile(prof);
      setProgress((prog as ProgressData | null) ?? null);
      setSportProgress((sports as SportProgress[]) ?? []);
      setEarnedBadges((badges as EarnedBadge[]) ?? []);
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

  const passportSports = useMemo(() => {
    const bySport = new Map(sportProgress.map((s) => [s.sport, s]));
    for (const sport of profile?.sports ?? []) {
      if (!bySport.has(sport)) {
        bySport.set(sport, {
          sport,
          skill_level: profile?.skill_level ?? null,
          xp: 0,
          level: 1,
          games_played: 0,
        });
      }
    }
    return Array.from(bySport.values());
  }, [profile, sportProgress]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-10 text-center">
          <Loader2 className="animate-spin text-primary mx-auto" />
        </div>
      </AppShell>
    );
  }

  const name = profile?.display_name || user?.email?.split("@")[0] || "Jugador";
  const overallXp = progress?.overall_xp ?? 0;
  const overallLevel = getLevelFromXp(overallXp);
  const currentStreak = progress?.current_streak ?? 0;
  const longestStreak = progress?.longest_streak ?? 0;
  const gamesPlayed = progress?.games_played ?? matchesCount;
  const friendsMade = progress?.sports_friends_made ?? connectionsCount;
  const badgesEarned = progress?.badges_earned ?? earnedBadges.length;
  const currentLevelXp = getXpForCurrentLevel(overallLevel);
  const nextLevelXp = getXpForNextLevel(overallLevel);
  const xpNeeded = getXpNeededForNextLevel(overallXp);
  const levelProgress = getLevelProgressPercentage(overallXp);

  return (
    <AppShell subtitle="Sports Passport">
      <section
        className="relative px-5 pt-6 pb-7 overflow-hidden"
        style={{ background: "linear-gradient(180deg, hsl(150 60% 6%) 0%, hsl(var(--background)) 100%)" }}
      >
        <div className="absolute inset-0 field-grid opacity-60 pointer-events-none" />
        <div className="relative flex flex-col items-center">
          <p className="text-[10px] uppercase tracking-[0.24em] font-mono text-primary mb-4">Sports Passport</p>
          <InitialsAvatar name={name} avatarPath={profile?.avatar_url} size={116} />
          <h1 className="font-display text-foreground text-center mt-4 leading-none" style={{ fontSize: 32, letterSpacing: "0.04em" }}>
            {name.toUpperCase()}
          </h1>
          <p className="font-body text-muted-foreground text-[13px] mt-2">
            {profile?.municipio ? `${profile.municipio}, NL` : "Monterrey, NL"}
          </p>
          {profile?.bio && <p className="text-sm text-muted-foreground text-center mt-4 max-w-xs">{profile.bio}</p>}

          <div className="w-full mt-6 rounded border border-primary/40 bg-card/70 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Nivel general</p>
                <p className="font-display text-5xl text-primary leading-none mt-1">{overallLevel}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl leading-none">{overallXp}</p>
                <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">XP total</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary glow-green" style={{ width: `${levelProgress}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
              <span>{overallXp - currentLevelXp} / {nextLevelXp - currentLevelXp} XP</span>
              <span>{xpNeeded} XP para nivel {overallLevel + 1}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mt-4">
            <PassportStat label="Partidos" value={gamesPlayed} icon={Trophy} />
            <PassportStat label="Amigos" value={friendsMade} icon={Users} />
            <PassportStat label="Badges" value={badgesEarned} icon={Medal} />
            <PassportStat label="Racha" value={currentStreak} icon={Flame} suffix="d" />
            <PassportStat label="Mejor racha" value={longestStreak} icon={Award} suffix="d" />
            <PassportStat label="Deportes" value={passportSports.length} icon={BarChart3} />
          </div>
        </div>
      </section>

      <section className="px-4 mt-6">
        <h2 className="font-display text-2xl leading-none">DEPORTES</h2>
        <div className="mt-3 space-y-3">
          {passportSports.length === 0 ? (
            <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Agrega tus deportes para empezar tu pasaporte.
            </div>
          ) : (
            passportSports.map((sport) => <SportPassportRow key={sport.sport} sport={sport} />)
          )}
        </div>
      </section>

      <section className="px-4 mt-6">
        <h2 className="font-display text-2xl leading-none">BADGES GANADOS</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {earnedBadges.length === 0 ? (
            <div className="col-span-2 rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Tus logros aparecerán aquí cuando empieces a jugar.
            </div>
          ) : (
            earnedBadges.map((badge) => {
              const def = badgeCatalog.find((b) => b.key === badge.badge_key);
              const Icon = def?.icon ?? Medal;
              return (
                <div key={badge.badge_key} className="rounded border border-border bg-card p-3">
                  <Icon size={18} className="text-primary" />
                  <p className="mt-2 font-display text-lg leading-none">{def?.title ?? badge.badge_key.toUpperCase()}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-snug">
                    {def?.description ?? "Logro ganado en PlayOn."}
                  </p>
                  {badge.earned_at && (
                    <p className="mt-1 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                      {fmtBadgeDate(badge.earned_at)}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

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

const PassportStat = ({ label, value, icon: Icon, suffix = "" }: { label: string; value: number; icon: LucideIcon; suffix?: string }) => (
  <div className="rounded border border-border bg-card p-2.5 text-center">
    <Icon size={15} className="text-primary mx-auto" />
    <p className="font-display text-2xl leading-none mt-1">
      {value}
      {suffix}
    </p>
    <p className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mt-1">{label}</p>
  </div>
);

const SportPassportRow = ({ sport }: { sport: SportProgress }) => {
  const level = getLevelFromXp(sport.xp);
  const current = getXpForCurrentLevel(level);
  const next = getXpForNextLevel(level);
  const needed = getXpNeededForNextLevel(sport.xp);
  const progress = getLevelProgressPercentage(sport.xp);
  return (
    <div className="rounded border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-xl">
          {SPORT_ICON[sport.sport] ?? "•"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-xl leading-none">{SPORT_LABEL[sport.sport] ?? sport.sport}</p>
          <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">
            {LEVEL_LABEL[sport.skill_level ?? ""] ?? "Sin nivel"} · {sport.games_played} partidos
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl leading-none text-primary">Lv {level}</p>
          <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">{sport.xp} XP</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
        <span>{sport.xp - current} / {next - current} XP</span>
        <span>{needed} XP para Lv {level + 1}</span>
      </div>
    </div>
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
