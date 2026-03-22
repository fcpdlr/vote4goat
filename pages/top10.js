import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const ENTITY_CATEGORY_ID = 1

export default function Top10Page() {
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [slots, setSlots] = useState(Array(10).fill(null))
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ipAddress, setIpAddress] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [results, setResults] = useState([])
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [topPoints, setTopPoints] = useState(1)

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        setIpAddress(data.ip)
      } catch (e) {
        console.warn('Could not get IP:', e)
      }
    }
    fetchIp()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      const { data, error } = await supabase
        .from('top10_categories')
        .select('id, title, description, entity_category_id')
        .eq('entity_category_id', ENTITY_CATEGORY_ID)
        .eq('is_active', true)
        .order('id', { ascending: true })
      if (error) { setError('Error loading categories.'); setIsLoadingCategories(false); return }
      const mapped = (data || []).map(row => ({ id: row.id, title: row.title, description: row.description }))
      setCategories(mapped)
      if (mapped.length > 0) setSelectedCategoryId(mapped[0].id)
      setIsLoadingCategories(false)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!selectedCategoryId) return
    const fetchCandidates = async () => {
      setIsLoadingCandidates(true)
      const { data, error } = await supabase
        .from('top10_category_entities')
        .select('entity_id, entities ( name )')
        .eq('top10_category_id', selectedCategoryId)
        .order('entities(name)', { ascending: true })
      if (error) { setError('Error loading candidates.'); setIsLoadingCandidates(false); return }
      setCandidates((data || []).map(row => ({ id: row.entity_id, name: row.entities.name })))
      setSlots(Array(10).fill(null))
      setSearch('')
      setIsLoadingCandidates(false)
    }
    fetchCandidates()
  }, [selectedCategoryId])

  useEffect(() => {
    if (!selectedCategoryId) return
    const fetchResults = async () => {
      setIsLoadingResults(true)
      const { data, error } = await supabase
        .from('top10_results_ordered')
        .select('entity_id, name, points, votes_count, top10_category_id')
        .eq('top10_category_id', selectedCategoryId)
        .order('points', { ascending: false })
        .limit(10)
      if (error) { setIsLoadingResults(false); return }
      const results = data || []
      setResults(results)
      if (results.length > 0) setTopPoints(results[0].points)
      setIsLoadingResults(false)
    }
    fetchResults()
  }, [selectedCategoryId])

  const selectedIds = slots.filter(Boolean).map(s => s.id)
  const filledCount = slots.filter(Boolean).length

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    !selectedIds.includes(c.id)
  )

  const handleAddCandidate = candidate => {
    const emptyIndex = slots.findIndex(s => s === null)
    if (emptyIndex === -1) return
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

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData('text/plain', String(index))
  }

  const handleDrop = (event, targetIndex) => {
    event.preventDefault()
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'), 10)
    if (Number.isNaN(fromIndex) || fromIndex === targetIndex) return
    const newSlots = [...slots]
    const temp = newSlots[fromIndex]
    newSlots[fromIndex] = newSlots[targetIndex]
    newSlots[targetIndex] = temp
    setSlots(newSlots)
  }

  const handleDragOver = event => event.preventDefault()

  const handleSubmit = async () => {
    setMessage(null)
    setError(null)
    if (slots.some(s => s === null)) { setError('Please fill all 10 positions before submitting.'); return }
    if (!selectedCategoryId) { setError('No category selected.'); return }
    setIsSubmitting(true)
    let userId = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch (err) {}
    let ip = ipAddress
    if (!ip) {
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        ip = data.ip
      } catch (e) {}
    }
    const { error: rpcError } = await supabase.rpc('submit_top10', {
      p_top10_category_id: selectedCategoryId,
      p_entity_ids: slots.map(s => s.id),
      p_user_id: userId,
      p_ip_address: ip,
    })
    if (rpcError) { setError('Error submitting. Please try again.'); setIsSubmitting(false); return }
    setIsSubmitting(false)
    setMessage('Your Top 10 has been submitted!')
  }

  const medal = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

  return (
    <>
      <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">

        {/* Header — mismo estilo que el resto */}
        <header className="flex items-center justify-between px-3 py-2">
          <span className="text-xl sm:text-2xl font-bold text-white">Vote4GOAT</span>
          <nav className="flex items-center gap-3 text-xs sm:text-sm">
            <a href="/football" className="hover:underline text-white/60">Duels</a>
            <a href="/top10" className="text-goat font-semibold">Top 10</a>
          </nav>
        </header>

        <div className="flex justify-center gap-4 mt-2 mb-2">
          <a href="/football" title="Football"><img src="/icons/football_logo.png" alt="Football" className="h-8 w-8 sm:h-10 sm:w-10" /></a>
          <a href="/basketball" title="Basketball"><img src="/icons/basketball_logo.png" alt="Basketball" className="h-8 w-8 sm:h-10 sm:w-10" /></a>
          <div title="Coming Soon" className="opacity-40 cursor-not-allowed"><img src="/icons/tennis_logo.png" alt="Tennis" className="h-8 w-8 sm:h-10 sm:w-10" /></div>
        </div>

        <h1 className="text-3xl font-extrabold mt-4 mb-1 text-goat text-center">YOUR TOP 10</h1>
        <p className="text-center text-white/40 text-xs mb-6">Build your list. See how the world ranks them.</p>

        <div className="w-full max-w-lg mx-auto flex flex-col gap-6">

          {/* Selector de categoría */}
          {isLoadingCategories ? (
            <p className="text-sm text-white/40 text-center">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-white/40 text-center">No categories available yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      selectedCategoryId === cat.id
                        ? 'bg-goat border-goat text-black font-semibold'
                        : 'bg-transparent border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
              {selectedCategoryId && (
                <p className="text-xs text-white/40 text-center">
                  {categories.find(c => c.id === selectedCategoryId)?.description}
                </p>
              )}
            </div>
          )}

          {/* Buscador */}
          {!isLoadingCandidates && (
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search and add a player..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-goat/50 transition"
              />
              {search && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-white/10 rounded-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                  {filteredCandidates.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-white/40">No matches found.</div>
                  ) : (
                    filteredCandidates.slice(0, 10).map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleAddCandidate(c)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 border-t border-white/5 first:border-0 transition"
                      >
                        {c.name}
                      </button>
                    ))
                  )}
                </div>
              )}
              <p className="mt-2 text-xs text-white/30 text-center">
                {filledCount}/10 players selected
              </p>
            </div>
          )}

          {/* Slots drag & drop */}
          <div className="flex flex-col gap-1.5">
            {slots.map((slot, index) => (
              <div
                key={index}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, index)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition ${
                  slot ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 border-dashed'
                }`}
              >
                <div className="w-6 text-center text-sm font-bold text-goat shrink-0">
                  {medal(index) || `${index + 1}`}
                </div>
                {slot ? (
                  <div
                    draggable
                    onDragStart={e => handleDragStart(e, index)}
                    className="flex-1 flex items-center justify-between cursor-move"
                  >
                    <span className="text-sm font-medium truncate">{slot.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(index)}
                      className="text-white/20 hover:text-white/60 ml-3 text-xs transition shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 text-xs text-white/20">
                    {index === 0 ? 'Your #1 — search above to add' : 'Empty'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Error / éxito */}
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          {message && <p className="text-sm text-goat text-center font-semibold">{message}</p>}

          {/* Botón submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCategoryId || filledCount < 10}
            className={`w-full py-3 rounded-xl text-sm font-bold transition ${
              isSubmitting || !selectedCategoryId || filledCount < 10
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                : 'bg-goat text-black hover:brightness-110'
            }`}
          >
            {isSubmitting ? 'Submitting...' : filledCount < 10 ? `Add ${10 - filledCount} more to submit` : 'Submit your Top 10'}
          </button>

        </div>

        {/* Resultados globales */}
        <div className="bg-background text-white px-4 py-8 mt-8 rounded-t-3xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <h2 className="text-2xl font-bold">GLOBAL TOP 10</h2>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/40 text-xs">live</span>
            </div>
          </div>

          {isLoadingResults ? (
            <p className="text-sm text-white/40 text-center">Loading...</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-white/40 text-center">No votes yet for this category.</p>
          ) : (
            <div className="flex justify-center">
              <table className="w-full max-w-md text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-goat text-left text-xs w-8">#</th>
                    <th className="px-2 py-2 text-goat text-center text-xs">PLAYER</th>
                    <th className="px-2 py-2 text-goat text-right text-xs hidden sm:table-cell w-16">PTS</th>
                    <th className="px-2 py-2 text-xs w-20 sm:w-28"></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => {
                    const rowStyle = i === 0 ? 'bg-goat/10 font-bold' : i === 1 ? 'bg-white/5 font-semibold' : i === 2 ? 'bg-white/5' : ''
                    const nameColor = i === 0 ? 'text-goat' : i === 1 ? 'text-white/90' : i === 2 ? 'text-white/80' : 'text-white/70'
                    const barPct = Math.round((row.points / topPoints) * 100)
                    const barColor = i === 0 ? 'bg-goat' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-white/20'
                    return (
                      <tr key={row.entity_id} className={`border-t border-white/5 hover:bg-white/5 transition ${rowStyle}`}>
                        <td className="pl-2 pr-1 py-2.5 text-xs text-white/40 w-8">{medal(i) || i + 1}</td>
                        <td className="pl-1 pr-2 py-2.5">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`truncate text-sm font-semibold max-w-[180px] ${nameColor}`}>{row.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-right text-xs text-white/40 hidden sm:table-cell w-16">{Math.round(row.points)}</td>
                        <td className="px-2 py-2.5 w-20 sm:w-28">
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${barPct}%` }} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
