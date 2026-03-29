import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Rank4VotePage() {
  const router = useRouter()
  const { id } = router.query

  const [question, setQuestion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [slots, setSlots] = useState([null, null, null, null])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [ipAddress, setIpAddress] = useState(null)
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const filledCount = slots.filter(Boolean).length
  const options = question ? [question.option_1, question.option_2, question.option_3, question.option_4] : []
  const usedOptions = slots.filter(Boolean)
  const availableOptions = options.filter(o => !usedOptions.includes(o))

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
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
    const fetchQuestion = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('rank4_questions')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()
      if (error) { setError('Question not found.'); setIsLoading(false); return }
      // Si ya cerró, redirigir a resultados
      if (data.closes_at && new Date(data.closes_at) < new Date()) {
        router.replace(`/rank4/${id}/results`)
        return
      }
      setQuestion(data)
      setIsLoading(false)
    }
    fetchQuestion()
  }, [id])

  const handleAddOption = (option) => {
    const emptyIndex = slots.findIndex(s => s === null)
    if (emptyIndex === -1) return
    const newSlots = [...slots]
    newSlots[emptyIndex] = option
    setSlots(newSlots)
  }

  const handleRemoveSlot = (index) => {
    const newSlots = [...slots]
    newSlots[index] = null
    setSlots(newSlots)
  }

  const handleDragStartSlot = (event, index) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'slot', index }))
  }

  const handleDragStartOption = (event, option) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'option', option }))
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

    if (data.type === 'option') {
      const newSlots = [...slots]
      for (let i = 0; i < newSlots.length; i++) {
        if (newSlots[i] === data.option) newSlots[i] = null
      }
      newSlots[targetIndex] = data.option
      setSlots(newSlots)
    }
  }

  const handleDragOver = (event) => event.preventDefault()

  const handleSubmit = async () => {
    if (filledCount < 4) { setError('Please rank all 4 options before submitting.'); return }
    setIsSubmitting(true)
    setError(null)

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

    const { error: insertError } = await supabase.from('rank4_votes').insert({
      question_id: Number(id),
      position_1: slots[0],
      position_2: slots[1],
      position_3: slots[2],
      position_4: slots[3],
      user_id: userId,
      ip_address: ip,
    })

    if (insertError) {
      setError('Error submitting. Please try again.')
      setIsSubmitting(false)
      return
    }

    setSubmitted(true)
    setIsSubmitting(false)
  }

  const getSlotStyle = (index) => {
    if (index === 0) return { backgroundColor: '#f5d06f', color: '#000' }
    if (index === 1) return { backgroundColor: '#d8d8dd', color: '#000' }
    if (index === 2) return { backgroundColor: '#d9a673', color: '#000' }
    return {}
  }

  const getNumberStyle = (index) => {
    if (index < 3) return 'text-black/60 font-bold'
    return 'text-goat font-bold'
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-extrabold text-goat text-center">Vote submitted!</h1>
        <p className="text-white/40 text-sm text-center max-w-xs">Your ranking has been recorded. Come back when the R4NK closes to see the world's verdict.</p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {slots.map((slot, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={getSlotStyle(i)}>
              <span className={`text-sm w-5 text-center shrink-0 ${getNumberStyle(i)}`}>{i + 1}</span>
              <span className="text-sm font-semibold truncate" style={{ color: i < 3 ? '#000' : '#fff' }}>{slot}</span>
            </div>
          ))}
        </div>
        <a href="/rank4" className="text-goat underline text-sm">← Back to R4NKs</a>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">
        <header className="flex items-center justify-between px-3 py-2">
          <a href="/" className="text-xl sm:text-2xl font-bold text-white">Vote4GOAT</a>
          <nav className="flex items-center gap-3 text-xs sm:text-sm">
            <a href="/rank4" className="text-white/60 hover:underline">R4NK</a>
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

        {isLoading ? (
          <p className="text-sm text-white/40 text-center mt-20">Loading...</p>
        ) : error && !question ? (
          <p className="text-sm text-red-400 text-center mt-20">{error}</p>
        ) : question ? (
          <div className="flex-1 mt-4 mb-8">
            <div className="max-w-lg mx-auto">
              <button onClick={() => router.push('/rank4')} className="text-xs text-white/40 hover:text-white/70 underline mb-4 transition">
                ← Back to R4NKs
              </button>

              <div className="text-center mb-6">
                <div className="text-xs uppercase tracking-widest text-goat mb-1">{question.sport}</div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{question.title}</h1>
                {question.description && (
                  <p className="text-xs text-white/40 max-w-sm mx-auto">{question.description}</p>
                )}
                {question.closes_at && (
                  <p className="text-xs text-white/30 mt-2">
                    Closes {new Date(question.closes_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                  </p>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">

                {/* Slots */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/50 uppercase tracking-wide">Your ranking</span>
                    <span className="text-xs text-white/40"><span className="text-goat font-semibold">{filledCount}</span> / 4</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {slots.map((slot, index) => (
                      <div
                        key={index}
                        onDragOver={handleDragOver}
                        onDrop={e => handleDrop(e, index)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl border border-white/10 transition"
                        style={slot ? getSlotStyle(index) : {}}
                      >
                        <span className={`text-sm w-5 text-center shrink-0 ${slot ? getNumberStyle(index) : 'text-goat font-bold'}`}>
                          {index + 1}
                        </span>
                        {slot ? (
                          <div draggable onDragStart={e => handleDragStartSlot(e, index)} className="flex-1 flex items-center cursor-move">
                            <span className="flex-1 text-sm font-semibold" style={{ color: '#000' }}>{slot}</span>
                            <button onClick={() => handleRemoveSlot(index)} className="text-black/40 hover:text-red-700 ml-2 text-xs shrink-0">✕</button>
                          </div>
                        ) : (
                          <div className="flex-1 border-b border-dashed border-white/10" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Options */}
                {availableOptions.length > 0 && (
                  <div className="w-full lg:w-48 shrink-0">
                    <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Options</p>
                    <div className="flex flex-col gap-1.5">
                      {availableOptions.map((opt, i) => (
                        <div
                          key={i}
                          draggable
                          onDragStart={e => handleDragStartOption(e, opt)}
                          onClick={() => handleAddOption(opt)}
                          className="cursor-pointer px-3 py-2.5 rounded-xl border border-white/10 text-sm text-white/70 hover:bg-white/5 hover:text-white transition text-center active:scale-95"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="mt-6">
                {error && <p className="text-sm text-red-400 text-center mb-3">{error}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || filledCount < 4}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition ${
                    isSubmitting || filledCount < 4
                      ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                      : 'bg-goat text-black hover:brightness-110'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : filledCount < 4 ? `Rank ${4 - filledCount} more to submit` : 'Submit your ranking'}
                </button>
              </div>

            </div>
          </div>
        ) : null}
      </main>
    </>
  )
}
