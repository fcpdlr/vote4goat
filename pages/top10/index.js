import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Clasifica categorías según el slug
const classifyCategory = (slug) => {
  if (!slug) return 'other'
  const s = slug.toLowerCase()

  // Clubs conocidos
  if (
    s.includes('real-madrid') ||
    s.includes('fc-barcelona') ||
    s.includes('barcelona-all-time') ||
    s.includes('bayern') ||
    s.includes('manchester-united') ||
    s.includes('liverpool') ||
    s.includes('ac-milan') ||
    s.includes('milan-all-time') ||
    s.includes('boca') ||
    s.includes('river')
  ) {
    return 'club'
  }

  // Selecciones / países conocidos
  if (
    s.startsWith('brazil-') ||
    s.startsWith('argentina-') ||
    s.startsWith('france-') ||
    s.startsWith('germany-') ||
    s.startsWith('spain-') ||
    s.startsWith('italy-') ||
    s.startsWith('england-')
  ) {
    return 'country'
  }

  // Todo lo demás, por defecto lo consideramos "position/other"
  return 'position'
}

const sportLabel = (entityCategoryId) => {
  if (entityCategoryId === 1) return 'Football'
  if (entityCategoryId === 2) return 'Basketball'
  if (entityCategoryId === 3) return 'Tennis'
  return 'Other'
}

// Tema visual por categoría (fondo del cuadro, colores de texto, etc.)
const getCategoryTheme = (slug) => {
  const base = {
    cardClass: 'bg-white/[0.04] hover:bg-white/[0.10] border-white/15',
    titleClass: 'text-white group-hover:text-goat',
    badgeClass: 'bg-black/40 border-white/15 text-gray-200',
  }

  if (!slug) return base
  const s = slug.toLowerCase()

  // Clubs
  if (s.includes('real-madrid')) {
    return {
      cardClass:
        'bg-gradient-to-br from-white via-gray-100 to-gray-300 border-gray-300 hover:border-goat',
      titleClass: 'text-black group-hover:text-goat',
      badgeClass: 'bg-black/40 border-black/30 text-white',
    }
  }

  if (s.includes('fc-barcelona') || s.includes('barcelona-all-time')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#004d98] via-[#004d98] to-[#a50044] border-[#a50044]/80 hover:border-white',
      titleClass: 'text-white group-hover:text-yellow-300',
      badgeClass: 'bg-black/40 border-white/30 text-gray-100',
    }
  }

  if (s.includes('bayern')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#dc052d] via-[#b80024] to-[#750014] border-[#ffb3c2]/40 hover:border-white',
      titleClass: 'text-white group-hover:text-yellow-200',
      badgeClass: 'bg-black/40 border-white/30 text-gray-100',
    }
  }

  if (s.includes('manchester-united')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#da291c] via-[#a00012] to-black border-[#fbe122]/40 hover:border-white',
      titleClass: 'text-white group-hover:text-[#fbe122]',
      badgeClass: 'bg-black/50 border-white/30 text-gray-100',
    }
  }

  if (s.includes('liverpool')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#c8102e] via-[#8b0018] to-[#111827] border-[#f6e3e7]/40 hover:border-white',
      titleClass: 'text-white group-hover:text-[#f6e3e7]',
      badgeClass: 'bg-black/50 border-white/30 text-gray-100',
    }
  }

  if (s.includes('ac-milan') || s.includes('milan-all-time')) {
    return {
      cardClass:
        'bg-gradient-to-br from-black via-[#111827] to-[#a0001e] border-[#ffccd5]/40 hover:border-white',
      titleClass: 'text-white group-hover:text-red-200',
      badgeClass: 'bg-black/60 border-white/30 text-gray-100',
    }
  }

  if (s.includes('boca')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#0033a0] via-[#0033a0] to-[#ffcc00] border-[#ffcc00]/60 hover:border-white',
      titleClass: 'text-white group-hover:text-[#ffcc00]',
      badgeClass: 'bg-black/50 border-white/30 text-gray-100',
    }
  }

  if (s.includes('river')) {
    return {
      cardClass:
        'bg-gradient-to-br from-white via-[#f3f4f6] to-[#e11d48] border-[#fecaca]/60 hover:border-white',
      titleClass: 'text-black group-hover:text-[#e11d48]',
      badgeClass: 'bg-black/30 border-black/20 text-white',
    }
  }

  // Selecciones
  if (s.startsWith('brazil-')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#ffdf00] via-[#ffdf00] to-[#009c3b] border-[#fde68a]/70 hover:border-white',
      titleClass: 'text-black group-hover:text-[#14532d]',
      badgeClass: 'bg-black/30 border-black/20 text-white',
    }
  }

  if (s.startsWith('argentina-')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#75aadb] via-[#75aadb] to-white border-[#bfdbfe]/70 hover:border-white',
      titleClass: 'text-black group-hover:text-[#0f172a]',
      badgeClass: 'bg-black/20 border-black/20 text-white',
    }
  }

  if (s.startsWith('france-')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#0055a4] via-[#003366] to-[#e51b23] border-[#bfdbfe]/70 hover:border-white',
      titleClass: 'text-white group-hover:text-[#fffbeb]',
      badgeClass: 'bg-black/40 border-white/30 text-gray-100',
    }
  }

  if (s.startsWith('germany-')) {
    return {
      cardClass:
        'bg-gradient-to-br from-black via-[#111827] to-white border-[#e5e7eb]/60 hover:border-white',
      titleClass: 'text-white group-hover:text-black',
      badgeClass: 'bg-black/50 border-white/30 text-gray-100',
    }
  }

  if (s.startsWith('spain-')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#aa151b] via-[#aa151b] to-[#f1bf00] border-[#fecaca]/70 hover:border-white',
      titleClass: 'text-white group-hover:text-yellow-200',
      badgeClass: 'bg-black/50 border-white/30 text-gray-100',
    }
  }

  if (s.startsWith('italy-')) {
    return {
      cardClass:
        'bg-gradient-to-br from-[#0072ce] via-[#0072ce] to-white border-[#bfdbfe]/70 hover:border-white',
      titleClass: 'text-white group-hover:text-[#fefce8]',
      badgeClass: 'bg-black/40 border-white/30 text-gray-100',
    }
  }

  if (s.startsWith('england-')) {
    return {
      cardClass:
        'bg-gradient-to-br from-white via-[#f3f4f6] to-[#c8102e] border-[#fecaca]/70 hover:border-white',
      titleClass: 'text-black group-hover:text-[#c8102e]',
      badgeClass: 'bg-black/30 border-black/20 text-white',
    }
  }

  // Por defecto
  return base
}

export default function Top10IndexPage() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [user, setUser] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const menuRef = useRef(null)
  const helpRef = useRef(null)

  // Usuario para el header
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {
        console.error('Error al obtener el usuario:', err)
      }
    }
    checkUser()
  }, [])

  // Cerrar menús al hacer click fuera o ESC
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelp(false)
      }
    }
    function handleEsc(event) {
      if (event.key === 'Escape') {
        setShowMenu(false)
        setShowHelp(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  // Cargar categorías Top 10
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('top10_categories')
        .select('id, slug, title, description, entity_category_id, is_active')
        .eq('is_active', true)
        .order('title', { ascending: true })

      if (error) {
        console.error('Error al cargar categorías Top10:', error)
        setError('Error loading Top 10 categories.')
        setIsLoading(false)
        return
      }

      setCategories(data || [])
      setIsLoading(false)
    }

    fetchCategories()
  }, [])

  // Agrupar por tipo
  const grouped = categories.reduce(
    (acc, cat) => {
      const type = classifyCategory(cat.slug)
      if (type === 'club') acc.clubs.push(cat)
      else if (type === 'country') acc.countries.push(cat)
      else if (type === 'position') acc.positions.push(cat)
      else acc.positions.push(cat)
      return acc
    },
    { clubs: [], countries: [], positions: [] }
  )

  // Ordenar dentro de cada grupo por título
  grouped.clubs.sort((a, b) => a.title.localeCompare(b.title))
  grouped.countries.sort((a, b) => a.title.localeCompare(b.title))
  grouped.positions.sort((a, b) => a.title.localeCompare(b.title))

  const Section = ({ title, items }) => {
    if (!items || items.length === 0) return null

    return (
      <section className="mb-12">
        <div className="mb-4 text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-goat">
            {title}
          </h2>
          <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
            {items.length} {items.length === 1 ? 'category' : 'categories'}
          </span>
          <div className="mx-auto mt-2 h-px w-16 bg-gradient-to-r from-transparent via-goat to-transparent opacity-70" />
        </div>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {items.map(cat => {
            const theme = getCategoryTheme(cat.slug)
            return (
              <a
                key={cat.id}
                href={`/top10/${cat.id}`}
                className={
                  'group block w-full max-w-xs rounded-2xl border transition px-4 py-4 h-32 flex flex-col items-center justify-center text-center ' +
                  theme.cardClass +
                  ' transform hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40'
                }
              >
                <div className="flex items-center justify-center gap-2 mb-2 px-2">
                  <h3
                    className={
                      'text-sm sm:text-base font-semibold line-clamp-2 ' +
                      theme.titleClass
                    }
                    style={{ fontVariant: 'small-caps' }}
                  >
                    {cat.title}
                  </h3>
                </div>
                <span
                  className={
                    'mt-1 inline-flex items-center justify-center text-[10px] px-2 py-[3px] rounded-full ' +
                    theme.badgeClass
                  }
                >
                  {sportLabel(cat.entity_category_id)}
                </span>
              </a>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <a href="/" className="text-xl sm:text-2xl font-bold text-white">
            Vote4GOAT
          </a>
        </div>
        <nav className="flex items-center gap-3 text-xs sm:text-sm">
          <a href="/top10" className="hover:underline text-goat font-semibold">
            Top 10s
          </a>
          <button onClick={() => setShowHelp(!showHelp)} className="hover:underline">
            About
          </button>
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-goat font-semibold hover:underline"
              >
                My Account
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-28 bg-white text-black rounded shadow-md z-50">
                  <a href="/account" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    Profile
                  </a>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      window.location.reload()
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/login" className="hover:underline">Log In</a>
              <a href="/signup" className="bg-goat text-black px-2 py-1 rounded-full font-semibold hover:brightness-105">
                Sign Up
              </a>
            </>
          )}
        </nav>
      </header>

      {/* ICONOS DE DEPORTE */}
      <div className="flex justify-center gap-4 mt-2 mb-2">
        <a href="/football" title="Football">
          <img src="/icons/football_logo.png" alt="Football" className="h-8 w-8 sm:h-10 sm:w-10" />
        </a>
        <a href="/basketball" title="Basketball">
          <img src="/icons/basketball_logo.png" alt="Basketball" className="h-8 w-8 sm:h-10 sm:w-10" />
        </a>
        <div title="Coming Soon" className="opacity-40 cursor-not-allowed">
          <img src="/icons/tennis_logo.png" alt="Tennis" className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
      </div>

      {/* ABOUT */}
      {showHelp && (
        <div
          ref={helpRef}
          className="max-w-xl mx-auto text-sm bg-white/5 text-white p-4 rounded-xl mt-2 border border-white/10"
        >
          <p className="mb-2 font-semibold text-goat">⚽ What is Vote4GOAT?</p>
          <p className="mb-2">
            Everyone has an opinion on who’s the greatest of all time — but what if we could let
            the world decide, one vote at a time?
          </p>
          <p className="mb-2">
            Vote4GOAT started with 1vs1 duels and now adds Top 10 lists for clubs and national
            teams. Build your own rankings and see how they compare with the community.
          </p>
          <p className="mt-4 font-semibold text-goat">🗳 Start voting. Shape the GOAT lists.</p>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 mt-6 mb-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400">
              Top 10 mode
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-goat">
              Build your all-time rankings
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto">
              Pick a club or national team and drag your Top&nbsp;10 from 1 to 10. Then see how your list compares with the community.
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-300 text-center">Loading categories...</p>
          ) : error ? (
            <p className="text-sm text-red-400 text-center">{error}</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-300 text-center">
              No Top 10 categories available yet.
            </p>
          ) : (
            <>
              <Section title="By club" items={grouped.clubs} />
              <Section title="By country" items={grouped.countries} />
              <Section title="By position / other" items={grouped.positions} />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
