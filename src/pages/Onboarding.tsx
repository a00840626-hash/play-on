import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, MapPin, Mail, ShieldCheck, Trophy, User as UserIcon, Building2 } from "lucide-react";

type Step = "splash" | "auth" | "userType" | "sports" | "skill" | "location" | "welcome";
type Sport = "futbol" | "tenis" | "padel";
type Skill = "principiante" | "intermedio" | "avanzado";
type UserType = "player" | "owner";

const sportsList: { id: Sport; label: string; emoji: string }[] = [
  { id: "futbol", label: "Fútbol", emoji: "⚽" },
  { id: "tenis", label: "Tenis", emoji: "🎾" },
  { id: "padel", label: "Pádel", emoji: "🏓" },
];

const skillList: { id: Skill; label: string; desc: string }[] = [
  { id: "principiante", label: "Principiante", desc: "Estoy empezando, vengo por diversión" },
  { id: "intermedio", label: "Intermedio", desc: "Juego regularmente y conozco las reglas" },
  { id: "avanzado", label: "Avanzado", desc: "Compito y entreno con frecuencia" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("splash");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [skill, setSkill] = useState<Skill | null>(null);

  // Auto-advance splash
  useEffect(() => {
    if (step !== "splash") return;
    const t = setTimeout(() => setStep("auth"), 1800);
    return () => clearTimeout(t);
  }, [step]);

  const finish = () => {
    try {
      localStorage.setItem(
        "playon:onboarding",
        JSON.stringify({ email, userType, sports, skill, completedAt: Date.now() })
      );
    } catch {}
    navigate("/");
  };

  const toggleSport = (s: Sport) =>
    setSports((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="min-h-full w-full bg-background text-foreground flex flex-col">
      {step === "splash" && <SplashScreen />}

      {step === "auth" && (
        <StepShell>
          <Logo small />
          <h1 className="font-display text-4xl mt-8 leading-none">
            ÚNETE A <span className="text-primary text-glow">PLAYON</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reserva canchas, encuentra partidos y juega con tu comunidad.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => setStep("userType")}
              className="w-full h-12 rounded bg-foreground text-background font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <GoogleIcon /> Continuar con Google
            </button>

            <button
              onClick={() => setStep("userType")}
              className="w-full h-12 rounded bg-foreground text-background font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <AppleIcon /> Continuar con Apple
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                o
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <label className="block">
              <span className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">
                Email
              </span>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full h-12 pl-9 pr-3 rounded bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>
            </label>

            <button
              disabled={!email.includes("@")}
              onClick={() => setStep("userType")}
              className="w-full h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed glow-green hover:brightness-110 transition"
            >
              Crear cuenta <ArrowRight size={16} />
            </button>

            <p className="text-[10px] text-muted-foreground text-center pt-2 leading-relaxed">
              Al continuar aceptas los <span className="text-foreground">Términos</span> y la{" "}
              <span className="text-foreground">Política de privacidad</span>.
            </p>

            <p className="text-sm text-muted-foreground text-center pt-4">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="text-primary font-bold hover:text-glow">
                Inicia sesión
              </a>
            </p>
          </div>
        </StepShell>
      )}

      {step === "userType" && (
        <StepShell title="¿Cómo vas a usar PlayOn?" subtitle="Elige tu tipo de cuenta.">
          <div className="space-y-3 mt-2">
            <TypeCard
              active={userType === "player"}
              onClick={() => setUserType("player")}
              icon={<UserIcon size={24} />}
              title="Jugador"
              desc="Reserva canchas, únete a partidos y conoce jugadores."
            />
            <TypeCard
              active={userType === "owner"}
              onClick={() => setUserType("owner")}
              icon={<Building2 size={24} />}
              title="Dueño de cancha"
              desc="Publica tu cancha, gestiona horarios y recibe reservas."
            />
          </div>
          <PrimaryNext disabled={!userType} onClick={() => setStep(userType === "owner" ? "location" : "sports")} />
        </StepShell>
      )}

      {step === "sports" && (
        <StepShell title="Tus deportes favoritos" subtitle="Selecciona uno o varios.">
          <div className="grid grid-cols-3 gap-3 mt-2">
            {sportsList.map((s) => {
              const active = sports.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSport(s.id)}
                  className={`relative aspect-square rounded border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    active
                      ? "border-primary bg-primary/10 glow-green"
                      : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <span className="text-4xl">{s.emoji}</span>
                  <span className="font-display text-base">{s.label}</span>
                  {active && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <PrimaryNext disabled={sports.length === 0} onClick={() => setStep("skill")} />
        </StepShell>
      )}

      {step === "skill" && (
        <StepShell title="Tu nivel de juego" subtitle="Sé honesto, así matcheamos mejor.">
          <div className="space-y-3 mt-2">
            {skillList.map((s) => {
              const active = skill === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSkill(s.id)}
                  className={`w-full text-left p-4 rounded border-2 transition-all ${
                    active
                      ? "border-primary bg-primary/10 glow-green"
                      : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl leading-none">{s.label}</span>
                    {active && (
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{s.desc}</p>
                </button>
              );
            })}
          </div>
          <PrimaryNext disabled={!skill} onClick={() => setStep("location")} />
        </StepShell>
      )}

      {step === "location" && (
        <StepShell>
          <div className="flex flex-col items-center text-center pt-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center glow-green animate-pulse-glow">
              <MapPin size={42} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl mt-6 leading-tight">
              ENCUENTRA <span className="text-primary text-glow">CANCHAS CERCA</span> DE TI
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-[280px]">
              Necesitamos tu ubicación para mostrarte canchas, partidos y jugadores en tu zona.
            </p>

            <div className="mt-6 w-full rounded border border-border bg-card p-4 flex items-start gap-3 text-left">
              <ShieldCheck size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Solo usamos tu ubicación mientras la app está abierta. Nunca la compartimos.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    () => setStep("welcome"),
                    () => setStep("welcome")
                  );
                } else setStep("welcome");
              }}
              className="w-full h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs glow-green hover:brightness-110 transition"
            >
              Permitir ubicación
            </button>
            <button
              onClick={() => setStep("welcome")}
              className="w-full h-12 rounded text-muted-foreground text-xs uppercase tracking-widest font-mono hover:text-foreground transition"
            >
              Ahora no
            </button>
          </div>
        </StepShell>
      )}

      {step === "welcome" && (
        <StepShell>
          <div className="flex flex-col items-center text-center pt-8 animate-fade-up">
            <div className="h-28 w-28 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center glow-green-strong">
              <Trophy size={48} className="text-primary" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-widest font-mono text-primary">
              ¡Bienvenido!
            </p>
            <h1 className="font-display text-5xl mt-2 leading-none">
              EL JUEGO <br />
              <span className="text-primary text-glow">EMPIEZA AHORA</span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground max-w-[280px]">
              Tu perfil está listo. Encuentra tu próximo partido y vive el deporte con tu comunidad.
            </p>

            <div className="mt-8 w-full grid grid-cols-3 gap-2 text-center">
              <Stat label="Deportes" value={sports.length || "—"} />
              <Stat label="Nivel" value={skill ? skill.slice(0, 4).toUpperCase() : "—"} />
              <Stat label="Tipo" value={userType === "owner" ? "OWNER" : "PLAYER"} />
            </div>
          </div>

          <button
            onClick={finish}
            className="mt-8 w-full h-14 rounded bg-primary text-primary-foreground font-display text-2xl tracking-widest glow-green-strong hover:brightness-110 transition"
          >
            ENTRAR A PLAYON
          </button>
        </StepShell>
      )}
    </div>
  );
};

/* ---------- Sub-components ---------- */

const SplashScreen = () => (
  <div className="flex-1 min-h-[600px] flex flex-col items-center justify-center stage-bg animate-fade-up">
    <Logo />
    <p className="mt-4 text-xs uppercase tracking-[0.4em] font-mono text-muted-foreground">
      El juego empieza aquí
    </p>
    <div className="mt-12 h-1 w-24 rounded-full bg-border overflow-hidden">
      <div className="h-full w-1/2 bg-primary animate-pulse" />
    </div>
  </div>
);

const Logo = ({ small = false }: { small?: boolean }) => (
  <div className="flex items-center gap-2">
    <div
      className={`${small ? "h-8 w-8" : "h-14 w-14"} rounded bg-primary flex items-center justify-center glow-green`}
    >
      <span className={`font-display ${small ? "text-2xl" : "text-4xl"} text-primary-foreground leading-none`}>
        P
      </span>
    </div>
    <span className={`font-display ${small ? "text-3xl" : "text-6xl"} leading-none`}>
      PLAY<span className="text-primary text-glow">ON</span>
    </span>
  </div>
);

const StepShell = ({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) => (
  <div className="flex-1 flex flex-col px-6 pt-16 pb-8 min-h-full">
    {title && (
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    )}
    <div className="flex-1 flex flex-col mt-6">{children}</div>
  </div>
);

const TypeCard = ({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 rounded border-2 flex items-start gap-4 transition-all ${
      active ? "border-primary bg-primary/10 glow-green" : "border-border bg-card hover:border-foreground/30"
    }`}
  >
    <div
      className={`h-12 w-12 rounded flex items-center justify-center flex-shrink-0 ${
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
      }`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <div className="font-display text-2xl leading-none">{title}</div>
      <p className="text-xs text-muted-foreground mt-1.5">{desc}</p>
    </div>
    {active && (
      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
        <Check size={14} strokeWidth={3} />
      </div>
    )}
  </button>
);

const PrimaryNext = ({ disabled, onClick }: { disabled: boolean; onClick: () => void }) => (
  <div className="mt-auto pt-8">
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 rounded bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed glow-green hover:brightness-110 transition"
    >
      Continuar <ArrowRight size={16} />
    </button>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded border border-border bg-card p-3">
    <div className="font-display text-xl leading-none text-primary">{value}</div>
    <div className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mt-1">
      {label}
    </div>
  </div>
);

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.6 15.4 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.1z"/>
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-4.9l-6-5.1c-2 1.4-4.4 2.2-6.9 2.2-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6 5.1C40.9 35 43.5 30 43.5 24c0-1.2-.1-2.3-.3-3.5z"/>
  </svg>
);

export default Onboarding;
