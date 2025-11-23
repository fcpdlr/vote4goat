import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Top10Home() {
  const router = useRouter()

  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [user, setUser] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const menuRef = useRef(null)
  const helpRef = useRef(null)

  // Usuario
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

  // Cargar categorías Top10
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('top10_categories')
        .select('id, slug, title, description, entity_category_id, is_active')
        .eq('is_active', true)
        .order('entity_category_id', { ascending: true })
        .order('title', { ascending: true })

      if (error) {
        console.error('Error al cargar categorías Top 10:', error)
        setError('Error loading Top 10 categories.')
        setIsLoading(false)
        return
      }

      setCategories(data || [])
      setIsLoading(false)
    }

    fetchCategories()
  }, [])

  const sportLabel = (entityCategoryId) => {
    if (entityCategoryId === 1) return 'Football'
    if (entityCategoryId === 2) return 'Basketball'
    if (entityCategoryId === 3) return 'Tennis'
    return 'Other'
  }

  // Clasificar por tipo: club / país / posición
  const classifyCategory = (slug) => {
    if (!slug) return 'other'
    const s = slug.toLowerCase()

    // Clubs
    if (
      s.includes('real-madrid') ||
      s.includes('fc-barcelona') ||
      s.includes('bayern') ||
      s.includes('manchester-united') ||
      s.includes('liverpool') ||
      s.includes('ac-milan') ||
      s.includes('boca-juniors') ||
      s.includes('river-plate')
    ) {
      return 'club'
    }

    // Países
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


    // Lo demás lo consideramos "position" / otros tipos
    return 'position'
  }

  const byClub = categories.filter(c => classifyCategory(c.slug) === 'club')
  const byCountry = categories.filter(c => classifyCategory(c.slug) === 'country')
  const byPosition = categories.filter(c => classifyCategory(c.slug) === 'position')

  const CategoryCard = ({ category }) => (
    <button
      onClick={() => router.push(`/top10/${category.id}`)}
      className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition flex flex-col gap-1"
    >
      <div className="text-[10px] uppercase tracking-wide text-goat">
        {sportLabel(category.entity_category_id)}
      </div>
      <div className="text-sm sm:text-base font-semibold">
        {category.title}
      </div>
      {category.description && (
        <div className="text-[11px] text-gray-300 line-clamp-2">
          {category.description}
        </div>
      )}
    </button>
  )

  const Section = ({ title, items, subtitle }) => {
    if (!items || items.length === 0) {
      // Si quieres que siempre aparezcan los bloques aunque estén vacíos:
      return (
        <section className="mt-6">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-lg font-bold text-goat">{title}</h2>
            {subtitle && <span className="text-[11px] text-gray-300">{subtitle}</span>}
          </div>
          <p className="text-xs text-gray-400 italic">
            Coming soon.
          </p>
        </section>
      )
    }

    return (
      <section className="mt-6">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-lg font-bold text-goat">{title}</h2>
          {subtitle && (
            <span className="text-[11px] text-gray-300">
              {items.length} categories
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(cat => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">
      {/* HEADER - igual que en home */}
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-bold text-white cursor-pointer" onClick={() => router.push('/')}>
            Vote4GOAT
          </span>
        </div>
        <nav className="flex items-center gap-3 text-xs sm:text-sm">
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
            Vote4GOAT is a simple, fun and addicting way to settle the debate. Two players appear
            on screen. You choose the one you think is greater. Your vote updates their score using
            a ranking system based on Elo — the same method used in chess and competitive gaming.
          </p>
          <p className="mb-2">
            The more people vote, the more accurate the ranking becomes. No stats, no explanations
            — just pure instinct and opinion.
          </p>
          <p className="mt-4 font-semibold text-goat">🗳 Start voting. Shape the GOAT list.</p>
        </div>
      )}

      {/* CONTENIDO */}
      <div className="flex-1 mt-4 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-goat mb-1">
              Top 10s
            </h1>
            <p className="text-xs sm:text-sm text-gray-300">
              Choose a category and build your all-time Top 10.
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-300 text-center">Loading categories...</p>
          ) : error ? (
            <p className="text-sm text-red-400 text-center">{error}</p>
          ) : (
            <>
              <Section
                title="By club"
                items={byClub}
                subtitle="Club legends and all-time teams"
              />
              <Section
                title="By country"
                items={byCountry}
                subtitle="National teams and international legends"
              />
              <Section
                title="By position"
                items={byPosition}
                subtitle="Positions, roles and special themes"
              />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
