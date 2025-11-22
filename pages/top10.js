import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Ajusta este ID al deporte que quieras usar (ej: fútbol = 1)
const ENTITY_CATEGORY_ID = 1

export default function Top10Page() {
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [candidates, setCandidates] = useState([]) // { id, name }
  const [search, setSearch] = useState('')
  const [slots, setSlots] = useState(Array(10).fill(null)) // 10 posiciones
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ipAddress, setIpAddress] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  // 1) Cargar IP una vez (para registrar submissions)
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

  // 2) Cargar categorías Top10 del deporte
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      setError(null)

      const { data, error } = await supabase
        .from('top10_categories')
        .select('id, title, description, entity_category_id')
        .eq('entity_category_id', ENTITY_CATEGORY_ID)
        .eq('is_active', true)
        .order('id', { ascending: true })

      if (error) {
        console.error('Error al cargar categorías Top10:', error)
        setError('Error loading Top 10 categories.')
        setIsLoadingCategories(false)
        return
      }

      const mapped = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
      }))

      setCategories(mapped)
      if (mapped.length > 0) {
        setSelectedCategoryId(mapped[0].id)
      }
      setIsLoadingCategories(false)
    }

    fetchCategories()
  }, [])

  // 3) Cargar candidatos cuando cambie la categoría seleccionada
  useEffect(() => {
    if (!selectedCategoryId) return

    const fetchCandidates = async () => {
      setIsLoadingCandidates(true)
      setError(null)

      // Necesitas que en Supabase exista la FK:
      // top10_category_entities.entity_id -> entities.id
      const { data, error } = await supabase
        .from('top10_category_entities')
        .select('entity_id, entities ( name )')
        .eq('top10_category_id', selectedCategoryId)
        .order('entities(name)', { ascending: true })

      if (error) {
        console.error('Error al cargar candidatos:', error)
        setError('Error loading candidates.')
        setIsLoadingCandidates(false)
        return
      }

      const mapped = (data || []).map(row => ({
        id: row.entity_id,        // uuid
        name: row.entities.name,  // nombre limpio para mostrar
      }))

      setCandidates(mapped)
      // Reiniciamos los slots al cambiar de categoría
      setSlots(Array(10).fill(null))
      setSearch('')
      setIsLoadingCandidates(false)
    }

    fetchCandidates()
  }, [selectedCategoryId])

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

    // Si quieres obligar a tener 10 puestos rellenos:
    if (slots.some(s => s === null)) {
      setError('Please fill all 10 positions before submitting.')
      return
    }

    if (!selectedCategoryId) {
      setError('No Top 10 category selected.')
      return
    }

    setIsSubmitting(true)

    const entityIds = slots.map(s => s.id) // uuid[] en orden 1..10

    // Usuario actual
    let userId = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch (err) {
      console.error('Error al obtener el usuario:', err)
    }

    // IP (ya intentada al inicio, pero la reintentamos si no hay)
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
      p_top10_category_id: selectedCategoryId,
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

  return (
    <main className="min-h-screen bg-background text-white px-4 py-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-goat">Top 10</h1>
        <a href="/" className="text-sm underline">
          ← Back to Duels
        </a>
      </header>

      {/* Selector de categoría */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Category</h2>
        {isLoadingCategories ? (
          <p className="text-sm text-gray-300">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-300">
            No Top 10 categories available yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedCategoryId === cat.id
                    ? 'bg-goat text-black border-goat'
                    : 'bg-transparent text-white border-white/40 hover:bg-white/10'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}

        {selectedCategoryId && (
          <p className="mt-2 text-xs text-gray-300">
            {categories.find(c => c.id === selectedCategoryId)?.description}
          </p>
        )}
      </section>

      {/* Buscador + sugerencias */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Add players</h2>
        {isLoadingCandidates ? (
          <p className="text-sm text-gray-300">Loading candidates...</p>
        ) : (
          <>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search player..."
              className="w-full max-w-md px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-goat"
            />
            {search && (
              <div className="mt-2 max-w-md bg-black/80 border border-white/10 rounded-lg max-h-48 overflow-y-auto">
                {filteredCandidates.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-300">
                    No matches found.
                  </div>
                ) : (
                  filteredCandidates.slice(0, 10).map(c => (
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
              You can select up to 10 players for this Top 10.
            </p>
          </>
        )}
      </section>

      {/* Posiciones 1–10 con drag & drop */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Top 10</h2>
        <div className="max-w-xl space-y-2">
          {slots.map((slot, index) => (
            <div
              key={index}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, index)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="w-6 text-sm font-bold text-goat">{index + 1}.</div>
              {slot ? (
                <div
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  className="flex-1 flex items-center justify-between px-3 py-1 rounded-md bg-black/60 cursor-move"
                >
                  <span className="text-sm truncate">{slot.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    className="text-xs text-gray-300 hover:text-red-400 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex-1 text-xs text-gray-400 italic">
                  Drag a player here or select from the search.
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Mensajes y botón enviar */}
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
        disabled={isSubmitting || !selectedCategoryId}
        className={`px-4 py-2 rounded-full text-sm font-semibold ${
          isSubmitting || !selectedCategoryId
            ? 'bg-gray-500 text-gray-200 cursor-not-allowed'
            : 'bg-goat text-black hover:brightness-110'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Top 10'}
      </button>
    </main>
  )
}
