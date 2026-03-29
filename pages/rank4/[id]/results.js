import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Rank4ResultsPage() {
  const router = useRouter()
  const { id } = router.query

  const [question, setQuestion] = useState(null)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

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
    if (!id) return
    const fetchData = async () => {
      setIsLoading(true)

      const { data: q, error: qError } = await supabase
        .from('rank4_questions')
        .select('*')
        .eq('id', id)
        .single()
      if (qError) { setError('Question not found.'); setIsLoading(false); return }
      setQuestion(q)

      const { data: r, error: rError } = await supabase
        .from('rank4_results')
        .select('*')
        .eq('question_id', id)
        .order('points', { ascending: false })
      if (rError) { setError('Error loading results.'); setIsLoading(false); return }
      setResults(r || [])
      setIsLoading(false)
    }
    fetchData()
  }, [id])

  const isOpen = (q) => {
    if (!q?.closes_at) return true
    return new Date(q.closes_at) > new Date()
  }

  const getSlotStyle = (index) => {
    if (index === 0) return { backgroundColor: '#f5d06f' }
    if (index === 1) return { backgroundColor: '#d8d8dd' }
    if (index === 2) return { backgroundColor: '#d9a673' }
    return { backgroundColor: '#1f2937' }
  }

  const getTextColor = (index) => index < 3 ? '#000' : '#fff'

  const totalVotes = results.length > 0 ? results[0].votes_count : 0
  const topPoints = results.length > 0 ? results[0].points : 1

  const shareText = question
    ? `The world has ranked: ${results.map((r, i) => `${i + 1}. ${r.option_text}`).join(', ')} — vote4goat.com/rank4/${id}/results`
    : ''

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
        ) : error ? (
          <p className="text-sm text-red-400 text-center mt-20">{error}</p>
        ) : question ? (
          <div className="flex-1 mt-4 mb-8">
            <div className="max-w-lg mx-auto">
              <button onClick={() => router.push('/rank4')} className="text-xs text-white/40 hover:text-white/70 underline mb-4 transition">
                ← Back to R4NKs
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-xs uppercase tracking-widest text-goat mb-1">{question.sport}</div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{question.title}</h1>
                {question.description && (
                  <p className="text-xs text-white/40 max-w-sm mx-auto mb-2">{question.description}</p>
                )}
                <div className="flex items-center justify-center gap-3 mt-2">
                  {isOpen(question) ? (
                    <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded-full">
                      Still open — vote now
                    </span>
                  ) : (
                    <span className="text-xs bg-white/5 text-white/30 px-2 py-1 rounded-full">Closed</span>
                  )}
                  {totalVotes > 0 && (
                    <span className="text-xs text-white/30">{totalVotes.toLocaleString()} votes</span>
                  )}
                </div>
              </div>

              {/* Results */}
              {results.length === 0 ? (
                <p className="text-sm text-white/40 text-center">No votes yet.</p>
              ) : (
                <div className="flex flex-col gap-2 mb-6">
                  {results.map((r, i) => {
                    const barPct = Math.round((r.points / topPoints) * 100)
                    return (
                      <div
                        key={r.option_text}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={getSlotStyle(i)}
                      >
                        <span className="text-sm font-bold w-5 text-center shrink-0" style={{ color: getTextColor(i) }}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm font-semibold truncate" style={{ color: getTextColor(i) }}>
                          {r.option_text}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 rounded-full bg-black/20 overflow-hidden">
                            <div className="h-full rounded-full bg-black/30" style={{ width: `${barPct}%` }} />
                          </div>
                          <span className="text-xs font-medium w-12 text-right" style={{ color: getTextColor(i), opacity: 0.6 }}>
                            {Math.round(r.points)} pts
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Share + actions */}
              <div className="flex flex-col gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl text-sm font-bold text-center bg-black border border-white/10 hover:bg-white/5 transition flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Share on X
                </a>
                {isOpen(question) && (
                  <a
                    href={`/rank4/${id}`}
                    className="w-full py-3 rounded-xl text-sm font-bold text-center bg-goat text-black hover:brightness-110 transition"
                  >
                    Vote now →
                  </a>
                )}
              </div>

            </div>
          </div>
        ) : null}
      </main>
    </>
  )
}
