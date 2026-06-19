import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => (
  <div className="min-h-full w-full bg-background text-foreground px-6 pt-10 pb-12">
    <Link to="/login" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-muted-foreground">
      <ArrowLeft size={14} /> Volver
    </Link>
    <h1 className="font-display text-4xl mt-6 leading-none">TÉRMINOS DE SERVICIO</h1>
    <p className="text-xs font-mono text-muted-foreground mt-2">Última actualización: 19 de junio de 2026</p>

    <div className="mt-6 space-y-5 text-sm leading-relaxed">
      <Section title="1. Aceptación">
        Al usar PlayOn aceptas estos términos. Si no estás de acuerdo, no uses la app.
      </Section>
      <Section title="2. Cuenta">
        Eres responsable de mantener la seguridad de tu cuenta y de toda actividad que ocurra en ella. Debes tener
        al menos 13 años para usar PlayOn.
      </Section>
      <Section title="3. Conducta">
        No puedes usar PlayOn para acoso, contenido ofensivo, fraude ni cualquier actividad ilegal. Trata a otros
        jugadores con respeto. Reservamos el derecho de suspender cuentas que violen estas reglas.
      </Section>
      <Section title="4. Partidos y reservas">
        PlayOn conecta jugadores y canchas pero no es responsable de la conducta entre usuarios ni de las
        condiciones de las canchas. Los pagos por reservas se realizan directamente con el dueño de la cancha en
        sitio.
      </Section>
      <Section title="5. Contenido del usuario">
        Mantienes la propiedad de tu contenido, pero nos otorgas licencia para mostrarlo en la app. No subas
        contenido sobre el que no tengas derechos.
      </Section>
      <Section title="6. Sin garantía">
        PlayOn se ofrece "tal cual". No garantizamos que el servicio esté libre de errores o disponible en todo
        momento.
      </Section>
      <Section title="7. Cambios">
        Podemos actualizar estos términos. Te avisaremos de cambios materiales por la app o por email.
      </Section>
      <Section title="8. Contacto">
        Para preguntas escríbenos a soporte@playon.app.
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

export default Terms;
