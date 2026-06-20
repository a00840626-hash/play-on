import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { InitialsAvatar } from "@/components/InitialsAvatar";

const SPORTS = ["futbol", "tenis", "padel", "basquetbol", "pickleball", "voleibol"] as const;
const SPORT_LABELS: Record<string, string> = {
  futbol: "Fútbol", tenis: "Tenis", padel: "Pádel", basquetbol: "Básquet", pickleball: "Pickleball", voleibol: "Voleibol",
};
const LEVELS = [
  { id: "principiante", label: "Principiante" },
  { id: "intermedio", label: "Intermedio" },
  { id: "avanzado", label: "Avanzado" },
];
const MUNICIPIOS = ["Monterrey", "San Pedro", "San Nicolás", "Guadalupe", "Apodaca", "Santa Catarina"];
const DAYS = [
  { id: "lun", label: "Lun" }, { id: "mar", label: "Mar" }, { id: "mie", label: "Mié" },
  { id: "jue", label: "Jue" }, { id: "vie", label: "Vie" }, { id: "sab", label: "Sáb" }, { id: "dom", label: "Dom" },
];

const ProfileEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [municipio, setMunicipio] = useState(MUNICIPIOS[0]);
  const [skill, setSkill] = useState("intermedio");
  const [sports, setSports] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name ?? "");
        setBio(data.bio ?? "");
        setMunicipio(data.municipio ?? MUNICIPIOS[0]);
        setSkill(data.skill_level ?? "intermedio");
        setSports(data.sports ?? []);
        setAvailability(data.availability ?? []);
        setAvatarPath(data.avatar_url ?? null);
      }
      setLoading(false);
    });
  }, [user]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (displayName.trim().length < 2) {
      toast({ title: "Nombre muy corto", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      municipio,
      skill_level: skill,
      sports,
      availability,
      avatar_url: avatarPath,
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Perfil actualizado" });
    navigate("/profile");
  };

  if (loading) {
    return <AppShell><div className="p-10 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div></AppShell>;
  }

  return (
    <AppShell subtitle="Editar perfil">
      <div className="px-4 pt-3 flex items-center gap-3">
        <Link to="/profile" className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-3xl leading-none">EDITAR PERFIL</h1>
      </div>

      <div className="flex justify-center mt-6">
        <InitialsAvatar name={displayName || user?.email} avatarPath={avatarPath} size={96} />
      </div>
      <div className="flex justify-center mt-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !user) return;
              if (file.size > 2 * 1024 * 1024) {
                toast({ title: "Imagen muy grande", description: "Máximo 2 MB", variant: "destructive" });
                return;
              }
              setUploading(true);
              const path = `${user.id}/avatar.jpg`;
              const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
              setUploading(false);
              if (error) {
                toast({ title: "Error al subir foto", description: error.message, variant: "destructive" });
                return;
              }
              setAvatarPath(path);
              toast({ title: "Foto actualizada" });
            }}
            disabled={uploading}
          />
          <span className="text-[11px] font-mono text-primary underline underline-offset-2">
            {uploading ? "Subiendo..." : avatarPath ? "Cambiar foto" : "Subir foto de perfil"}
          </span>
        </label>
      </div>

      <form onSubmit={save} className="px-4 mt-6 space-y-5 pb-8">
        <Field label="Nombre">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm"
            required
          />
        </Field>

        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="Cuéntales a otros sobre ti..."
            className="w-full px-3 py-2 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm resize-none"
          />
        </Field>

        <Field label="Municipio">
          <select value={municipio} onChange={(e) => setMunicipio(e.target.value)}
            className="w-full h-12 px-3 rounded bg-card border border-border focus:border-primary focus:outline-none text-sm">
            {MUNICIPIOS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>

        <Field label="Nivel">
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button key={l.id} type="button" onClick={() => setSkill(l.id)}
                className={`h-11 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono ${skill === l.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Deportes">
          <div className="grid grid-cols-3 gap-2">
            {SPORTS.map((s) => (
              <button key={s} type="button" onClick={() => toggle(sports, setSports, s)}
                className={`h-11 rounded-sm border text-xs font-bold uppercase tracking-widest font-mono ${sports.includes(s) ? "bg-primary text-primary-foreground border-primary glow-green" : "bg-card border-border text-muted-foreground"}`}>
                {SPORT_LABELS[s]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Disponibilidad">
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((d) => (
              <button key={d.id} type="button" onClick={() => toggle(availability, setAvailability, d.id)}
                className={`h-11 rounded-sm border text-xs font-bold uppercase font-mono ${availability.includes(d.id) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
                {d.label}
              </button>
            ))}
          </div>
        </Field>

        <button type="submit" disabled={saving}
          className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm glow-green hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center">
          {saving ? <Loader2 size={16} className="animate-spin" /> : "Guardar cambios"}
        </button>
      </form>
    </AppShell>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1.5">{label}</span>
    {children}
  </label>
);

export default ProfileEdit;
