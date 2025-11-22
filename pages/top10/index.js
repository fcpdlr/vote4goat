import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Top10IndexPage() {
  const [categories, setCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const menuRef = useRef(null)
  const helpRef = useRef(null)

  // Obtener usuario logado
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

  // Cargar categorías de Top10
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      setError(null)

      const { data, error } = await supabase
        .from('top10_categories')
        .select('id, title, description, entity_category_id, slug, is_active')
        .eq('is_active', true)
        .order('entity_category_id', { ascending: true })
        .order('id', { ascending: true })

      if (error) {
        console.error('Error al cargar categorías Top10:', error)
        setError('Error loading Top 10 categories.')
        setIsLoadingCategories(false)
        return
      }

      setCategories(data || [])
      setIsLoadingCategories(false)
    }

    fetchCategories()
  }, [])

  const sportLabel = (entityCategoryId) => {
    if (entityCategoryId === 1) return 'Football'
    if (entityCategoryId === 2) return 'Basketball'
    if (entityCategoryId === 3) return 'Tennis'
    return 'Other'
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">
      {/* HEADER - mismo que en la home */}
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-bold text-white">Vote4GOAT</span>
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

      {/* ICONOS DE DEPORTES (mismo que en home) */}
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 mt-4 mb-8">
        <h1 className="text-3xl font-extrabold mb-4 text-goat text-center">
          TOP 10 RANKINGS
        </h1>
        <p className="text-center text-sm text-gray-300 mb-6 max-w-2xl mx-auto">
          Choose a category and build your own Top 10. Then see how your ranking compares to the
          global consensus.
        </p>

        {error && (
          <p className="text-center text-sm text-red-400 mb-4">{error}</p>
        )}

        {isLoadingCategories ? (
          <p className="text-center text-sm text-gray-300">Loading Top 10 categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-gray-300">
            No Top 10 categories available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {categories.map(cat => (
              <a
                key={cat.id}
                href={`/top10/${cat.id}`}
                className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition shadow-sm"
              >
                <div className="text-xs uppercase tracking-wide text-goat mb-1">
                  {sportLabel(cat.entity_category_id)}
                </div>
                <h2 className="text-sm sm:text-base font-semibold mb-1">
                  {cat.title}
                </h2>
                {cat.description && (
                  <p className="text-xs text-gray-300 line-clamp-3">
                    {cat.description}
                  </p>
                )}
                <div className="mt-3 text-xs text-goat font-semibold">
                  Build your Top 10 →
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
