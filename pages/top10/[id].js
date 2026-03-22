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
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [slots, setSlots] = useState(Array(10).fill(null))
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ipAddress, setIpAddress] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showInspiration, setShowInspiration] = useState(false)

  const menuRef = useRef(null)
  const helpRef = useRef(null)
  const selectedCount = slots.filter(Boolean).length

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {}
    }
    checkUser()
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false)
      if (helpRef.current && !helpRef.current.contains(event.target)) setShowHelp(false)
    }
    function handleEsc(event) {
      if (event.key === 'Escape') { setShowMenu(false); setShowHelp(false) }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        setIpAddress(data.ip)
      } catch (e) {}
    }
    fetchIp()
  }, [])

  useEffect(() => {
    if (!id) return
    const fetchCategory = async () => {
      setIsLoadingCategory(true)
      const { data, error } = await supabase
        .from('top10_categories')
        .select('id, slug, title, description, entity_category_id, is_active')
        .eq('id', id)
        .eq('is_active', true)
        .single()
      if (error) { setError('Error loading this category.'); setIsLoadingCategory(false); return }
      setCategory(data)
      setIsLoadingCategory(false)
    }
    fetchCategory()
  }, [id])

  useEffect(() => {
    if (!id) return
    const fetchCandidates = async () => {
      setIsLoadingCandidates(true)
      const { data, error } = await supabase
        .from('top10_category_entities')
        .select('entity_id, entities ( name )')
        .eq('top10_category_id', id)
      if (error) { setError('Error loading candidates.'); setIsLoadingCandidates(false); return }
      setCandidates(
        (data || [])
          .map(row => ({ id: row.entity_id, name: row.entities.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      setSlots(Array(10).fill(null))
      setSearch('')
      setIsLoadingCandidates(false)
    }
    fetchCandidates()
  }, [id])

  const selectedIds = slots.filter(Boolean).map(s => s.id)
  const availableCandidates = candidates.filter(c => !selectedIds.includes(c.id))
  const filteredCandidates = availableCandidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
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

  const handleReset = () => {
    setSlots(Array(10).fill(null))
    setSearch('')
    setMessage(null)
    setError(null)
  }

  const handleDragStartSlot = (event, index) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'slot', index }))
  }

  const handleDragStartCandidate = (event, candidate) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'candidate', id: candidate.id }))
  }

  const handleDrop = (event, targetIndex) => {
    event.preventDefault()
    const raw = event.dataTransfer.getData('text/plain')
    if (!raw) return
    let data
    try { data = JSON.parse(raw) } catch { return }

    if (data.type === 'slot') {
      const fromIndex = data.index
      if (fromIndex === targetIndex) return
      const newSlots = [...slots]
      const temp = newSlots[fromIndex]
      newSlots[fromIndex] = newSlots[targetIndex]
      newSlots[targetIndex] = temp
      setSlots(newSlots)
      return
    }

    if (data.type === 'candidate') {
      const candidate = candidates.find(c => c.id === data.id)
      if (!candidate) return
      const newSlots = [...slots]
      for (let i = 0; i < newSlots.length; i++) {
        if (newSlots[i]?.id === candidate.id) newSlots[i] = null
      }
      newSlots[targetIndex] = candidate
      setSlots(newSlots)
    }
  }

  const handleDragOver = event => event.preventDefault()

  const handleSubmit = async () => {
    setMessage(null)
    setError(null)
    if (slots.some(s => s === null)) { setError('Please fill all 10 positions before submitting.'); return }
    if (!id) { setError('No category selected.'); return }
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
      p_top10_category_id: Number(id),
      p_entity_ids: slots.map(s => s.id),
      p_user_id: userId,
      p_ip_address: ip,
    })
    if (rpcError) {
      setError(`Error: ${rpcError.message || rpcError.details || 'Unknown error.'}`)
      setIsSubmitting(false)
      return
    }
    setIsSubmitting(false)
    setMessage('Your Top 10 has been submitted!')
  }

  const sportLabel = id => id === 1 ? 'Football' : id === 2 ? 'Basketball' : id === 3 ? 'Tennis' : 'Other'

  const getRowStyle = index => {
    if (index === 0) return { backgroundColor: '#f5d06f' }
    if (index === 1) return { backgroundColor: '#d8d8dd' }
    if (index === 2) return { backgroundColor: '#d9a673' }
    return {}
  }

  const getTextClass = index => index < 3
    ? 'text-base sm:text-lg tracking-wide uppercase font-semibold'
    : 'text-sm sm:text-base tracking-wide uppercase'

  const getRemoveClass = index => index < 3
    ? 'text-xs text-black/60 hover:text-red-700 ml-2 shrink-0'
    : 'text-xs text-white/30 hover:text-red-400 ml-2 shrink-0'

  const getNumberClass = index => index < 3 ? 'text-black/70 font-bold' : 'text-goat font-bold'

  return (
    <>
      <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">

        <header className="flex items-center justify-between px-3 py-2">
          <a href="/" className="text-xl sm:text-2xl font-bold text-white">Vote4GOAT</a>
          <nav className="flex items-center gap-3 text-xs sm:text-sm">
            <a href="/top10" className="text-white/60 hover:underline">Top 10s</a>
            <button onClick={() => setShowHelp(!showHelp)} className="hover:underline">About</button>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="text-goat font-semibold hover:underline">My Account</button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-28 bg-white text-black rounded shadow-md z-50">
                    <a href="/account" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</a>
                    <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/login" className="hover:underline">Log In</a>
                <a href="/signup" className="bg-goat text-black px-2 py-1 rounded-full font-semibold hover:brightness-105">Sign Up</a>
              </>
            )}
          </nav>
        </header>

        <div className="flex justify-center gap-4 mt-2 mb-2">
          <a href="/football" title="Football"><img src="/icons/football_logo.png" alt="Football" className="h-8 w-8 sm:h-10 sm:w-10" /></a>
          <a href="/basketball" title="Basketball"><img src="/icons/basketball_logo.png" alt="Basketball" className="h-8 w-8 sm:h-10 sm:w-10" /></a>
          <div title="Coming Soon" className="opacity-40 cursor-not-allowed"><img src="/icons/tennis_logo.png" alt="Tennis" className="h-8 w-8 sm:h-10 sm:w-10" /></div>
        </div>

        {showHelp && (
          <div ref={helpRef} className="max-w-xl mx-auto text-sm bg-white/5 text-white p-4 rounded-xl mt-2 border border-white/10">
            <p className="mb-2 font-semibold text-goat">⚽ What is Vote4GOAT?</p>
            <p className="mb-2">Everyone has an opinion on who's the greatest of all time — but what if we could let the world decide, one vote at a time?</p>
            <p className="mb-2">Build your Top 10 for clubs and national teams, drag to reorder, and see how your list compares with the community.</p>
            <p className="mt-4 font-semibold text-goat">🗳 Start voting. Shape the GOAT lists.</p>
          </div>
        )}

        <div className="flex-1 mt-4 mb-8">
          <div className="max-w-5xl mx-auto">
            <button onClick={() => router.push('/top10')} className="text-xs text-white/40 hover:text-white/70 underline mb-4 transition">
              ← Back to Top 10 categories
            </button>

            {isLoadingCategory ? (
              <p className="text-sm text-white/40 text-center">Loading...</p>
            ) : !category ? (
              <p className="text-sm text-red-400 text-center">Category not found.</p>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <div className="text-xs uppercase tracking-widest text-goat mb-1">{sportLabel(category.entity_category_id)}</div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-goat mb-1">{category.title}</h1>
                  {category.description && (
                    <p className="text-xs sm:text-sm text-white/50 max-w-xl mx-auto">{category.description}</p>
                  )}
                </div>

                {/* Buscador */}
                <section className="mb-6 max-w-xl mx-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Add players</h2>
                    <span className="text-xs text-white/40">
                      Selected: <span className="text-goat font-semibold">{selectedCount}</span> / 10
                    </span>
                  </div>
                  {isLoadingCandidates ? (
                    <p className="text-sm text-white/40">Loading candidates...</p>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search player in this category..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-goat/50 transition"
                      />
                      {search && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-white/10 rounded-xl overflow-hidden z-20 max-h-52 overflow-y-auto">
                          {filteredCandidates.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-white/40">No matches found.</div>
                          ) : (
                            filteredCandidates.slice(0, 20).map(c => (
                              <button key={c.id} onClick={() => handleAddCandidate(c)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 border-t border-white/5 first:border-0 transition">
                                {c.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      <p className="mt-2 text-xs text-white/30">You can select up to 10 players. Each position matters.</p>
                    </div>
                  )}
                </section>

                {/* Slots + Inspiration */}
                <section className="mt-2">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-6">
                    <div className="w-full max-w-xl mx-auto lg:mx-0">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Your Top 10</h2>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setShowInspiration(prev => !prev)} className="text-xs text-goat hover:underline transition">
                            {showInspiration ? 'Hide inspiration' : 'I need inspiration'}
                          </button>
                          <button type="button" onClick={handleReset} className="text-xs text-white/30 hover:text-red-400 underline transition">
                            Reset list
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {slots.map((slot, index) => (
                          <div
                            key={index}
                            onDragOver={handleDragOver}
                            onDrop={e => handleDrop(e, index)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 transition"
                            style={getRowStyle(index)}
                          >
                            <div className={`w-6 text-sm shrink-0 text-center ${getNumberClass(index)}`}>{index + 1}</div>
                            {slot ? (
                              <div draggable onDragStart={e => handleDragStartSlot(e, index)} className="flex-1 flex items-center cursor-move">
                                <div className="flex-1 text-center">
                                  <span className={getTextClass(index)} style={{ fontVariant: 'small-caps' }}>
                                    {slot.name}
                                  </span>
                                </div>
                                <button type="button" onClick={() => handleRemoveSlot(index)} className={getRemoveClass(index)}>✕</button>
                              </div>
                            ) : (
                              <div className="flex-1 text-xs italic" style={{ color: index < 3 ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.2)' }}>
                                {index === 0 ? 'Your #1 — search above or use inspiration' : 'Empty'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Panel Inspiration */}
                    {showInspiration && (
                      <div className="w-full lg:w-56 lg:shrink-0">
                        <div className="mb-1 text-xs font-semibold text-goat uppercase tracking-widest">Inspiration</div>
                        <p className="text-xs text-white/40 mb-3">Drag & drop into a position, or click to add.</p>
                        <div className="max-h-[520px] overflow-y-auto space-y-1.5">
                          {availableCandidates.length === 0 ? (
                            <p className="text-xs text-white/30 italic">All players are already in your list.</p>
                          ) : (
                            availableCandidates.map(c => (
                              <div
                                key={c.id}
                                draggable
                                onDragStart={e => handleDragStartCandidate(e, c)}
                                onClick={() => handleAddCandidate(c)}
                                className="cursor-grab active:cursor-grabbing px-3 py-2 rounded-xl border border-white/10 text-xs hover:bg-white/5 flex items-center justify-center text-center transition"
                              >
                                <span className="tracking-wide uppercase" style={{ fontVariant: 'small-caps' }}>{c.name}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Submit */}
                <section className="pt-6 text-center max-w-xl mx-auto">
                  {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
                  {message && <p className="mb-3 text-sm text-goat font-semibold">{message}</p>}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !id || selectedCount < 10}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition ${
                      isSubmitting || !id || selectedCount < 10
                        ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                        : 'bg-goat text-black hover:brightness-110'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : selectedCount < 10 ? `Add ${10 - selectedCount} more to submit` : 'Submit your Top 10'}
                  </button>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
