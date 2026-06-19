import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => (
  <div className="min-h-full w-full bg-background text-foreground px-6 pt-10 pb-12">
    <Link to="/login" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-muted-foreground">
      <ArrowLeft size={14} /> Volver
    </Link>
    <h1 className="font-display text-4xl mt-6 leading-none">POLÍTICA DE PRIVACIDAD</h1>
    <p className="text-xs font-mono text-muted-foreground mt-2">Última actualización: 19 de junio de 2026</p>

    <div className="mt-6 space-y-5 text-sm leading-relaxed">
      <Section title="1. Información que recopilamos">
        PlayOn recopila la información que tú proporcionas al crear una cuenta (nombre, email, municipio, deportes,
        nivel y disponibilidad) y datos generados al usar la app (partidos, reservas, mensajes y conexiones con otros
        usuarios).
      </Section>
      <Section title="2. Cómo usamos tu información">
        Usamos tu información para conectarte con otros jugadores, mostrarte partidos y canchas relevantes, procesar
        tus reservas y mejorar el servicio. No vendemos tus datos a terceros.
      </Section>
      <Section title="3. Compartir información">
        Tu nombre, deportes y municipio son visibles para otros usuarios autenticados de PlayOn. Los mensajes
        privados solo los ven los participantes de cada conversación.
      </Section>
      <Section title="4. Almacenamiento y seguridad">
        Los datos se almacenan de forma cifrada en infraestructura de Supabase. Aplicamos controles de acceso por
        usuario (Row Level Security) para que cada quien solo vea lo que le corresponde.
      </Section>
      <Section title="5. Tus derechos">
        Puedes editar o eliminar tu perfil en cualquier momento desde la app. Al eliminar tu cuenta se borran
        permanentemente tus datos personales, mensajes y conexiones.
      </Section>
      <Section title="6. Menores de edad">
        PlayOn no está dirigido a menores de 13 años. No recopilamos conscientemente información de menores.
      </Section>
      <Section title="7. Contacto">
        Para preguntas sobre privacidad escríbenos a privacy@playon.app.
      </Section>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="font-display text-lg text-primary">{title}</h2>
    <p className="mt-2 text-muted-foreground">{children}</p>
  </section>
);

export default PrivacyPolicy;
