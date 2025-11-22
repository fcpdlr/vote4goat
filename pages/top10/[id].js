import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Top10CategoryPage() {
  const router = useRouter()
  const { id } = router.query

  const [category, setCategory] = useState(null)
  const [isLoadingCategory, setIsLoadingCategory] = useState(true)

  const [candidates, setCandidates] = useState([]) // { id, name }
  const [search, setSearch] = useState('')
  const [slots, setSlots] = useState(Array(10).fill(null)) // 10 posiciones

  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ipAddress, setIpAddress] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const [user, setUser] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const menuRef = useRef(null)
  const helpRef = useRef(null)

  const selectedCount = slots.filter(Boolean).length

  // HEADER: usuario actual
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

  // HEADER: cerrar menús al hacer click fuera o ESC
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

  // IP para registrar submissions
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        setIpAddress(data.ip)
      } catch (e) {
        console.warn('No se pudo obtener la IP:', e)
      }
    }
    fetchIp()
  }, [])

  // Cargar datos de la categoría
  useEffect(() => {
    if (!id) return

    const fetchCategory = async () => {
      setIsLoadingCategory(true)
      setError(null)

      const { data, error } = await supabase
        .from('top10_categories')
        .select('id, title, description, entity_category_id, is_active')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error al cargar categoría Top10:', error)
        setError('Error loading this Top 10 category.')
        setIsLoadingCategory(false)
        return
      }

      setCategory(data)
      setIsLoadingCategory(false)
    }

    fetchCategory()
  }, [id])

  // Cargar candidatos de la categoría
  useEffect(() => {
    if (!id) return

    const fetchCandidates = async () => {
      setIsLoadingCandidates(true)
      setError(null)

      const { data, error } = await supabase
        .from('top10_category_entities')
        .select('entity_id, entities ( name )')
        .eq('top10_category_id', id)
        .order('entities(name)', { ascending: true })

      if (error) {
        console.error('Error al cargar candidatos:', error)
        setError('Error loading candidates.')
        setIsLoadingCandidates(false)
        return
      }

      const mapped = (data || []).map(row => ({
        id: row.entity_id,
        name: row.entities.name,
      }))

      setCandidates(mapped)
      setSlots(Array(10).fill(null))
      setSearch('')
      setIsLoadingCandidates(false)
    }

    fetchCandidates()
  }, [id])

  // IDs ya usados en el Top10 actual
  const selectedIds = slots
    .filter(Boolean)
    .map(s => s.id)

  // Candidatos que matchean el search y no están ya elegidos
  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    !selectedIds.includes(c.id)
  )

  const handleAddCandidate = candidate => {
    const emptyIndex = slots.findIndex(s => s === null)
    if (emptyIndex === -1) {
      alert('You already selected 10 players.')
      return
    }
    const newSlots = [...slots]
    newSlots[emptyIndex] = candidate
    setSlots(newSlots)
    setSearch('')
  }

  const handleRemoveSlot = index => {
    const newSlots = [...slots]
    newSlots[index] = null
    setSlots(newSlots)
  }

  const handleReset = () => {
    setSlots(Array(10).fill(null))
    setSearch('')
    setMessage(null)
    setError(null)
  }

  // Drag & drop entre posiciones 1-10 (HTML5 nativo)
  const handleDragStart = (event, index) => {
    event.dataTransfer.setData('text/plain', String(index))
  }

  const handleDrop = (event, targetIndex) => {
    event.preventDefault()
    const fromIndexRaw = event.dataTransfer.getData('text/plain')
    if (!fromIndexRaw) return
    const fromIndex = parseInt(fromIndexRaw, 10)
    if (Number.isNaN(fromIndex)) return
    if (fromIndex === targetIndex) return

    const newSlots = [...slots]
    const temp = newSlots[fromIndex]
    newSlots[fromIndex] = newSlots[targetIndex]
    newSlots[targetIndex] = temp
    setSlots(newSlots)
  }

  const handleDragOver = event => {
    event.preventDefault()
  }

  const handleSubmit = async () => {
    setMessage(null)
    setError(null)

    if (slots.some(s => s === null)) {
      setError('Please fill all 10 positions before submitting.')
      return
    }

    if (!id) {
      setError('No Top 10 category selected.')
      return
    }

    setIsSubmitting(true)

    const entityIds = slots.map(s => s.id)

    // Usuario actual
    let userId = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch (err) {
      console.error('Error al obtener el usuario:', err)
    }

    // IP (si no la tenemos, reintentar)
    let ip = ipAddress
    if (!ip) {
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        ip = data.ip
        setIpAddress(data.ip)
      } catch (e) {
        console.warn('No se pudo obtener IP en submit:', e)
      }
    }

    const { error: rpcError } = await supabase.rpc('submit_top10', {
      p_top10_category_id: Number(id),
      p_entity_ids: entityIds,
      p_user_id: userId,
      p_ip_address: ip,
    })

    if (rpcError) {
      console.error('Error al enviar Top 10:', rpcError)
      setError('Error submitting your Top 10. Please try again.')
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    setMessage('Your Top 10 has been submitted. Thank you!')
  }

  const sportLabel = (entityCategoryId) => {
    if (entityCategoryId === 1) return 'Football'
    if (entityCategoryId === 2) return 'Basketball'
    if (entityCategoryId === 3) return 'Tennis'
    return 'Other'
  }

  // Fondo de cada fila (oro/plata/bronce para 1,2,3; transparente para el resto)
  const getRowInlineStyle = (index) => {
    const pos = index + 1
    if (pos === 1) {
      return { backgroundColor: '#f5d06f' } // dorado suave
    }
    if (pos === 2) {
      return { backgroundColor: '#d8d8dd' } // plateado suave
    }
    if (pos === 3) {
      return { backgroundColor: '#d9a673' } // bronce suave
    }
    return { backgroundColor: 'transparent' }
  }

  // Clases del “card” interior (sin fondos, solo layout)
  const getSlotClasses = (hasPlayer) => {
    if (!hasPlayer) return ''
    return 'flex-1 flex items-center justify-between px-3 py-1 rounded-md cursor-move'
  }

  // Color del texto del botón de cerrar según fila (para que contraste)
  const getRemoveButtonClasses = (index) => {
    const pos = index + 1
    if (pos <= 3) {
      return 'text-xs text-black/70 hover:text-red-700 ml-2'
    }
    return 'text-xs text-gray-300 hover:text-red-400 ml-2'
  }

  const getPlayerTextClasses = (index) => {
    const pos = index + 1
    if (pos <= 3) {
      return 'text-sm truncate text-black font-semibold'
    }
    return 'text-sm truncate'
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">
      {/* HEADER - igual que en home */}
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

      {/* ICONOS DE DEPORTES */}
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

      {/* CONTENIDO CENTRADO */}
      <div className="flex-1 mt-4 mb-8">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => router.push('/top10')}
            className="text-xs text-gray-300 underline mb-3"
          >
            ← Back to Top 10 categories
          </button>

          {isLoadingCategory ? (
            <p className="text-sm text-gray-300">Loading category...</p>
          ) : !category ? (
            <p className="text-sm text-red-400">
              This Top 10 category could not be loaded.
            </p>
          ) : (
            <>
              {/* Cabecera de la categoría */}
              <div className="mb-5 text-center">
                <div className="text-xs uppercase tracking-wide text-goat mb-1">
                  {sportLabel(category.entity_category_id)}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-goat mb-1">
                  {category.title}
                </h1>
                {category.description && (
                  <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Buscador + sugerencias */}
              <section className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Add players</h2>
                  <span className="text-xs text-gray-300">
                    Selected: <span className="text-goat font-semibold">{selectedCount}</span> / 10
                  </span>
                </div>

                {isLoadingCandidates ? (
                  <p className="text-sm text-gray-300">Loading candidates...</p>
                ) : (
                  <>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search player in this category..."
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-goat"
                    />
                    {search && (
                      <div className="mt-2 bg-black/80 border border-white/10 rounded-lg max-h-52 overflow-y-auto">
                        {filteredCandidates.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-gray-300">
                            No matches found.
                          </div>
                        ) : (
                          filteredCandidates.slice(0, 12).map(c => (
                            <button
                              key={c.id}
                              onClick={() => handleAddCandidate(c)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
                            >
                              {c.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-300">
                      You can select up to 10 players. Each position matters.
                    </p>
                  </>
                )}
              </section>

              {/* Posiciones 1–10 */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Your Top 10</h2>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-gray-300 hover:text-red-400 underline"
                  >
                    Reset list
                  </button>
                </div>

                <div className="space-y-2">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, index)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white"
                      style={getRowInlineStyle(index)}
                    >
                      <div className="w-6 text-sm font-bold text-goat">{index + 1}.</div>
                      {slot ? (
                        <div
                          draggable
                          onDragStart={e => handleDragStart(e, index)}
                          className={getSlotClasses(!!slot)}
                        >
                          <span className={getPlayerTextClasses(index)}>{slot.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(index)}
                            className={getRemoveButtonClasses(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 text-xs text-gray-800/70 italic">
                          Drag a player here or select from the search.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Mensajes y botón enviar */}
              <section className="pt-4 text-center">
                {error && (
                  <div className="mb-3 text-sm text-red-400">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="mb-3 text-sm text-goat">
                    {message}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !id}
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    isSubmitting || !id
                      ? 'bg-gray-500 text-gray-200 cursor-not-allowed'
                      : 'bg-goat text-black hover:brightness-110 shadow-md'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Top 10'}
                </button>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

