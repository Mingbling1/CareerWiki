import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Términos de Servicio | Empliq",
  description:
    "Términos y condiciones de uso de la plataforma Empliq. Conoce tus derechos y obligaciones como usuario.",
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 mt-4">
            Términos de Servicio
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar Empliq (&quot;la Plataforma&quot;), aceptas quedar vinculado por estos
              Términos de Servicio. Si no estás de acuerdo con alguno de estos términos, no debes
              utilizar la Plataforma.
            </p>
            <p>
              Empliq es una plataforma de transparencia laboral que opera bajo las leyes de la
              República del Perú. Estos términos se rigen por la legislación peruana vigente,
              incluyendo el Código Civil, la Ley de Protección al Consumidor (Ley 29571) y la
              Ley de Protección de Datos Personales (Ley 29733).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">2. Descripción del Servicio</h2>
            <p>
              Empliq proporciona una plataforma donde los usuarios pueden:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Consultar información salarial reportada anónimamente por otros usuarios.</li>
              <li>Leer y escribir reseñas sobre empresas peruanas.</li>
              <li>Explorar beneficios laborales reportados por empleados.</li>
              <li>Acceder a información pública de empresas registradas ante SUNAT.</li>
            </ul>
            <p>
              La información disponible en Empliq es proporcionada por usuarios de forma voluntaria
              y anónima. Empliq no garantiza la exactitud, veracidad o completitud de dicha información.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">3. Registro y Cuenta de Usuario</h2>
            <p>
              Para acceder a ciertas funcionalidades, debes crear una cuenta utilizando el método
              de autenticación disponible (Google OAuth). Al registrarte:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Garantizas que la información proporcionada es verídica.</li>
              <li>Eres responsable de mantener la confidencialidad de tu cuenta.</li>
              <li>Aceptas notificar inmediatamente cualquier uso no autorizado de tu cuenta.</li>
              <li>Debes ser mayor de 18 años para utilizar la Plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">4. Contenido del Usuario</h2>
            <p>
              Al publicar contenido en Empliq (reseñas, datos salariales, opiniones), declaras que:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>El contenido se basa en tu experiencia laboral real y directa.</li>
              <li>No incluyes información falsa, difamatoria o malintencionada.</li>
              <li>No violas acuerdos de confidencialidad (NDA) ni secretos comerciales.</li>
              <li>No publicas datos personales de terceros sin su consentimiento.</li>
              <li>
                Otorgas a Empliq una licencia no exclusiva, mundial y gratuita para usar,
                mostrar y distribuir dicho contenido en la Plataforma.
              </li>
            </ul>
            <p>
              Empliq se reserva el derecho de moderar, editar o eliminar contenido que viole
              estos términos o que sea reportado por otros usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">5. Uso Aceptable</h2>
            <p>Te comprometes a no:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utilizar la Plataforma para fines ilegales o no autorizados.</li>
              <li>Publicar contenido ofensivo, discriminatorio o que atente contra la dignidad de las personas.</li>
              <li>Intentar acceder a cuentas de otros usuarios o a sistemas internos de Empliq.</li>
              <li>Realizar scraping, crawling o extracción masiva de datos sin autorización.</li>
              <li>Manipular calificaciones o publicar reseñas falsas.</li>
              <li>Utilizar la Plataforma para acosar, intimidar o difamar a personas o empresas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">6. Propiedad Intelectual</h2>
            <p>
              El diseño, código fuente, logotipos y marca &quot;Empliq&quot; son propiedad de sus creadores.
              Empliq es un proyecto de código abierto bajo licencia MIT en lo que respecta
              a su código fuente. El contenido generado por usuarios permanece como propiedad
              de sus autores, sujeto a la licencia de uso otorgada en la sección 4.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">7. Información de Empresas</h2>
            <p>
              La información de empresas mostrada en Empliq proviene de fuentes públicas
              (SUNAT, registros comerciales) y de reportes de usuarios. Empliq:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No se hace responsable por la exactitud de la información pública mostrada.</li>
              <li>No tiene relación contractual ni comercial con las empresas listadas.</li>
              <li>Respeta el derecho de las empresas a solicitar corrección de información incorrecta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">8. Limitación de Responsabilidad</h2>
            <p>
              Empliq se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;. No garantizamos que:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>El servicio sea ininterrumpido, seguro o libre de errores.</li>
              <li>Los datos salariales reflejen con exactitud las condiciones del mercado laboral.</li>
              <li>Las reseñas representen la experiencia de todos los empleados de una empresa.</li>
            </ul>
            <p>
              En ningún caso Empliq será responsable por daños directos, indirectos, incidentales
              o consecuentes derivados del uso de la Plataforma, conforme a lo establecido en el
              Código Civil peruano (artículos 1314-1332).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">9. Resolución de Controversias</h2>
            <p>
              Cualquier controversia derivada de estos términos se resolverá de acuerdo con la
              legislación peruana. Las partes acuerdan someterse a la jurisdicción de los tribunales
              de Lima, Perú. Antes de iniciar cualquier procedimiento legal, las partes intentarán
              resolver el conflicto de manera amigable mediante comunicación directa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">10. Modificaciones</h2>
            <p>
              Empliq se reserva el derecho de modificar estos términos en cualquier momento.
              Los cambios serán efectivos al ser publicados en esta página. El uso continuado
              de la Plataforma después de cualquier modificación constituye la aceptación de
              los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">11. Contacto</h2>
            <p>
              Para consultas sobre estos términos, puedes contactarnos en:{" "}
              <a
                href="mailto:legal@empliq.io"
                className="text-neutral-900 underline hover:no-underline"
              >
                legal@empliq.io
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
