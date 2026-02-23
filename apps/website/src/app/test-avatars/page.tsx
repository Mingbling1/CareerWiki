import Image from 'next/image'

const avatars = [
  { name: 'Boy Stripes', file: 'avatar_boy_stripes.png' },
  { name: 'Man Beard', file: 'avatar_man_beard.png' },
  { name: 'Person Dots', file: 'avatar_person_dots.png' },
  { name: 'Man Bun', file: 'avatar_man_bun.png' },
  { name: 'Grandma Glasses', file: 'avatar_grandma_glasses.png' },
  { name: 'Woman Long Hair', file: 'avatar_woman_long_hair.png' },
  { name: 'Girl Buns', file: 'avatar_girl_buns.png' },
  { name: 'Man Hat Glasses', file: 'avatar_man_hat_glasses.png' },
  { name: 'Woman Hat', file: 'avatar_woman_hat.png' },
  { name: 'Kid Beanie', file: 'avatar_kid_beanie.png' },
  { name: 'Woman Polka', file: 'avatar_woman_polka.png' },
  { name: 'Person Sunglasses', file: 'avatar_person_sunglasses.png' },
]

export default function TestAvatars() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-2">🎨 Test de Avatares</h1>
      <p className="text-gray-500 mb-8">
        Revisando cómo se ven los avatares cortados en distintos fondos.
      </p>

      {/* Fondo blanco */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          📋 Fondo Blanco
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 bg-white p-6 rounded-xl border border-gray-200">
          {avatars.map((a) => (
            <div key={a.file} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                <Image
                  src={`/avatars/${a.file}`}
                  alt={a.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-gray-500 text-center">{a.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Fondo gris claro */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          📋 Fondo Gris Claro (#f3f4f6)
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 bg-gray-100 p-6 rounded-xl">
          {avatars.map((a) => (
            <div key={a.file} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image
                  src={`/avatars/${a.file}`}
                  alt={a.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-gray-600 text-center">{a.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Fondo oscuro */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          📋 Fondo Oscuro (#1f2937)
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 bg-gray-800 p-6 rounded-xl">
          {avatars.map((a) => (
            <div key={a.file} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                <Image
                  src={`/avatars/${a.file}`}
                  alt={a.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-gray-300 text-center">{a.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Fondo azul (accent) */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          📋 Fondo Azul Accent (#3b82f6)
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 bg-blue-500 p-6 rounded-xl">
          {avatars.map((a) => (
            <div key={a.file} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                <Image
                  src={`/avatars/${a.file}`}
                  alt={a.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-white text-center">{a.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Fondo cream */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          📋 Fondo Cream (#f5f0e8)
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 p-6 rounded-xl" style={{ backgroundColor: '#f5f0e8' }}>
          {avatars.map((a) => (
            <div key={a.file} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#f5f0e8' }}>
                <Image
                  src={`/avatars/${a.file}`}
                  alt={a.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-gray-600 text-center">{a.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tamaños variados para la app */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          📐 Distintos tamaños (como se usarían en la app)
        </h2>
        <div className="flex items-end gap-6 bg-white p-6 rounded-xl border border-gray-200">
          {/* XS - Comment avatar */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image src="/avatars/avatar_boy_stripes.png" alt="xs" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-[10px] text-gray-400">32px</span>
          </div>
          {/* SM */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image src="/avatars/avatar_woman_long_hair.png" alt="sm" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-[10px] text-gray-400">40px</span>
          </div>
          {/* MD */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image src="/avatars/avatar_grandma_glasses.png" alt="md" width={56} height={56} className="object-contain" />
            </div>
            <span className="text-[10px] text-gray-400">56px</span>
          </div>
          {/* LG */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image src="/avatars/avatar_kid_beanie.png" alt="lg" width={80} height={80} className="object-contain" />
            </div>
            <span className="text-[10px] text-gray-400">80px</span>
          </div>
          {/* XL */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image src="/avatars/avatar_man_hat_glasses.png" alt="xl" width={112} height={112} className="object-contain" />
            </div>
            <span className="text-[10px] text-gray-400">112px</span>
          </div>
          {/* 2XL */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image src="/avatars/avatar_person_sunglasses.png" alt="2xl" width={160} height={160} className="object-contain" />
            </div>
            <span className="text-[10px] text-gray-400">160px</span>
          </div>
        </div>
      </section>

      {/* Simulación de comentarios anónimos */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          💬 Simulación: Comentarios anónimos
        </h2>
        <div className="max-w-2xl space-y-4">
          {[
            { avatar: 'avatar_boy_stripes.png', text: 'Excelente ambiente de trabajo y mucho aprendizaje técnico.', rating: 5 },
            { avatar: 'avatar_woman_long_hair.png', text: 'Buenos beneficios y flexibilidad de horario.', rating: 4 },
            { avatar: 'avatar_grandma_glasses.png', text: 'Buen lugar para empezar carrera en frontend.', rating: 4 },
            { avatar: 'avatar_man_hat_glasses.png', text: 'Rol con mucha autonomía y responsabilidad.', rating: 5 },
          ].map((comment, i) => (
            <div key={i} className="flex gap-3 bg-white p-4 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                <Image src={`/avatars/${comment.avatar}`} alt="anon" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">Anónimo</span>
                  <span className="text-xs text-gray-400">hace 2 días</span>
                  <span className="text-xs">{'⭐'.repeat(comment.rating)}</span>
                </div>
                <p className="text-sm text-gray-600">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
