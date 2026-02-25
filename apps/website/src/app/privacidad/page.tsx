import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de Privacidad | Empliq",
  description:
    "Política de privacidad y protección de datos personales de Empliq, conforme a la Ley 29733 de Protección de Datos Personales del Perú.",
}

export default function PrivacidadPage() {
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
            Política de Privacidad
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
            <p className="text-base text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              Esta política cumple con la <strong>Ley N° 29733</strong> — Ley de Protección de Datos
              Personales del Perú — y su Reglamento aprobado por Decreto Supremo N° 003-2013-JUS.
              Tu privacidad es fundamental para nosotros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">1. Responsable del Tratamiento</h2>
            <p>
              Empliq es la plataforma responsable del tratamiento de tus datos personales.
              Para cualquier consulta relacionada con la protección de tus datos, puedes
              contactarnos en:{" "}
              <a
                href="mailto:privacidad@empliq.io"
                className="text-neutral-900 underline hover:no-underline"
              >
                privacidad@empliq.io
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">2. Datos que Recopilamos</h2>
            <p>Recopilamos los siguientes tipos de datos:</p>

            <h3 className="text-lg font-medium text-neutral-800 mt-4">2.1 Datos de registro (Google OAuth)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre completo proporcionado por Google.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Foto de perfil de Google (opcional).</li>
            </ul>

            <h3 className="text-lg font-medium text-neutral-800 mt-4">2.2 Datos aportados voluntariamente</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Información salarial (monto, moneda, periodo).</li>
              <li>Reseñas de empresas (calificación, opiniones).</li>
              <li>Cargo o posición laboral.</li>
              <li>Años de experiencia.</li>
            </ul>
            <p className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm">
              <strong>Importante:</strong> Los datos salariales y reseñas se publican de forma
              completamente anónima. No se vincula públicamente tu identidad con el contenido
              que aportas. Esto está garantizado por diseño en nuestra arquitectura técnica.
            </p>

            <h3 className="text-lg font-medium text-neutral-800 mt-4">2.3 Datos técnicos</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dirección IP (para seguridad y prevención de abuso).</li>
              <li>Tipo de navegador y dispositivo.</li>
              <li>Páginas visitadas y tiempo de navegación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">3. Finalidad del Tratamiento</h2>
            <p>
              Conforme al artículo 5 de la Ley 29733, tus datos se tratan para las
              siguientes finalidades:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Prestación del servicio:</strong> Permitirte acceder y usar las funcionalidades de Empliq.</li>
              <li><strong>Anonimización:</strong> Desvincular tu identidad de los datos salariales y reseñas que aportas.</li>
              <li><strong>Seguridad:</strong> Prevenir fraude, abuso y accesos no autorizados.</li>
              <li><strong>Mejora del servicio:</strong> Analizar patrones de uso para mejorar la experiencia.</li>
              <li><strong>Comunicaciones:</strong> Enviar notificaciones sobre tu cuenta (si las activas).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">4. Base Legal del Tratamiento</h2>
            <p>El tratamiento de tus datos se basa en:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Consentimiento (Art. 13.5, Ley 29733):</strong> Al crear tu cuenta y
                aceptar estos términos, otorgas consentimiento libre, informado, expreso e inequívoco.
              </li>
              <li>
                <strong>Ejecución contractual:</strong> Necesario para la prestación del servicio
                que solicitas al registrarte.
              </li>
              <li>
                <strong>Interés legítimo:</strong> Para la seguridad de la plataforma y prevención
                de abuso.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">5. Anonimización de Datos</h2>
            <p>
              Empliq implementa un sistema de anonimización por diseño:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Los datos salariales se almacenan sin vinculación directa a tu cuenta de usuario.</li>
              <li>Las reseñas se publican sin mostrar tu nombre ni correo electrónico.</li>
              <li>
                No es posible para otros usuarios, empresas ni terceros identificar
                al autor de una reseña o dato salarial.
              </li>
              <li>
                Este diseño cumple con el principio de minimización de datos establecido
                en la Ley 29733.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">6. Derechos ARCO</h2>
            <p>
              Conforme a los artículos 18-27 de la Ley 29733, tienes los siguientes derechos
              sobre tus datos personales:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Acceso:</strong> Solicitar información sobre qué datos tuyos tenemos.</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
              <li><strong>Cancelación:</strong> Solicitar la eliminación de tus datos.</li>
              <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos para fines específicos.</li>
            </ul>
            <p>
              Para ejercer estos derechos, envía un correo a{" "}
              <a
                href="mailto:privacidad@empliq.io"
                className="text-neutral-900 underline hover:no-underline"
              >
                privacidad@empliq.io
              </a>
              {" "}con tu solicitud. Responderemos en un plazo máximo de 10 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">7. Almacenamiento y Seguridad</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tus datos se almacenan en servidores seguros con cifrado en tránsito (TLS) y en reposo.</li>
              <li>Utilizamos autenticación OAuth 2.0 a través de Google, sin almacenar contraseñas.</li>
              <li>El acceso a la base de datos está restringido y protegido por firewalls.</li>
              <li>Realizamos respaldos periódicos y monitoreo de seguridad.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">8. Transferencia Internacional de Datos</h2>
            <p>
              Tus datos pueden ser procesados en servidores ubicados fuera del Perú
              (infraestructura en la nube). En estos casos, garantizamos un nivel de
              protección equivalente al exigido por la Ley 29733 y cumplimos con lo
              establecido en el artículo 15 de dicha ley sobre flujo transfronterizo
              de datos personales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">9. Cookies y Tecnologías Similares</h2>
            <p>Empliq utiliza cookies esenciales para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Autenticación:</strong> Mantener tu sesión activa.</li>
              <li><strong>Preferencias:</strong> Recordar tu configuración (moneda, idioma).</li>
            </ul>
            <p>
              No utilizamos cookies de terceros con fines publicitarios ni de seguimiento
              (tracking). No compartimos datos con redes publicitarias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">10. Menores de Edad</h2>
            <p>
              Empliq no está dirigido a menores de 18 años. No recopilamos intencionalmente
              datos de menores. Si detectamos que un menor ha proporcionado datos,
              procederemos a eliminarlos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">11. Retención de Datos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Cuenta activa:</strong> Conservamos tus datos mientras mantengas tu cuenta.
              </li>
              <li>
                <strong>Eliminación de cuenta:</strong> Al solicitar la eliminación de tu cuenta,
                borraremos tus datos personales en un plazo de 30 días. Los datos anonimizados
                (salarios, reseñas) permanecerán en la plataforma ya que no son identificables.
              </li>
              <li>
                <strong>Obligación legal:</strong> Algunos datos pueden conservarse por plazos
                adicionales si la ley lo requiere.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">12. Autoridad de Protección de Datos</h2>
            <p>
              Si consideras que tus derechos han sido vulnerados, puedes presentar una
              reclamación ante la Autoridad Nacional de Protección de Datos Personales (ANPDP),
              adscrita al Ministerio de Justicia y Derechos Humanos del Perú.
            </p>
            <p>
              Dirección: Scipión Llona 350, Miraflores, Lima 15074, Perú.
              <br />
              Web:{" "}
              <a
                href="https://www.gob.pe/anpd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-900 underline hover:no-underline"
              >
                www.gob.pe/anpd
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">13. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de actualizar esta política. Notificaremos cambios
              significativos a través de la Plataforma o por correo electrónico. La versión
              vigente siempre estará disponible en esta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">14. Contacto</h2>
            <p>
              Para cualquier consulta sobre esta política de privacidad:{" "}
              <a
                href="mailto:privacidad@empliq.io"
                className="text-neutral-900 underline hover:no-underline"
              >
                privacidad@empliq.io
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
