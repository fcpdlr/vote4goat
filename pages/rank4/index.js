import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Rank4IndexPage() {
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
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
    function handleEsc(event) {
      if (event.key === 'Escape') setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('rank4_questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) console.error('Error loading R4NK questions:', error)
      setQuestions(data || [])
      setIsLoading(false)
    }
    fetchQuestions()
  }, [])

  const isOpen = (q) => {
    if (!q.closes_at) return true
    return new Date(q.closes_at) > new Date()
  }

  const daysLeft = (closes_at) => {
    if (!closes_at) return null
    const diff = new Date(closes_at) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days <= 0) return 'Closed'
    if (days === 1) return '1 day left'
    return `${days} days left`
  }

  return (
    <>
    <Head>
        <title>R4NK — Weekly Rankings | Vote4GOAT</title>
        <meta name="description" content="Order 4 players from best to worst. One question per week. The world's verdict revealed." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://vote4goat.com/rank4" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="R4NK — Weekly Rankings | Vote4GOAT" />
        <meta property="og:description" content="Order 4 players from best to worst. One question per week. The world's verdict revealed." />
        <meta property="og:url" content="https://vote4goat.com/rank4" />
        <meta property="og:image" content="https://vote4goat.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Vote4GOAT" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="R4NK — Weekly Rankings | Vote4GOAT" />
        <meta name="twitter:description" content="Order 4 players from best to worst. One question per week. The world's verdict revealed." />
        <meta name="twitter:image" content="https://vote4goat.com/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">
        <header className="flex items-center justify-between px-3 py-2">
          <a href="/" className="text-xl sm:text-2xl font-bold text-white">Vote4GOAT</a>
          <nav className="flex items-center gap-3 text-xs sm:text-sm">
            <a href="/football" className="text-white/60 hover:underline">Duels</a>
            <a href="/top10" className="text-white/60 hover:underline">Top 10s</a>
            <a href="/rank4" className="text-goat font-semibold">R4NK</a>
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

        <h1 className="text-3xl font-extrabold mt-4 mb-1 text-goat text-center">R4NK</h1>
        <p className="text-center text-white/40 text-xs mb-8">Order 4. The world decides.</p>

        <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
          {isLoading ? (
            <p className="text-sm text-white/40 text-center">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-white/40 text-center">No active R4NKs right now. Check back soon.</p>
          ) : (
            questions.map(q => {
              const open = isOpen(q)
              return (
                <a
                  key={q.id}
                  href={open ? `/rank4/${q.id}` : `/rank4/${q.id}/results`}
                  className="block bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-goat/40 hover:bg-white/[0.07] transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-base font-semibold text-white leading-tight">{q.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 font-medium ${open ? 'bg-green-900/40 text-green-400' : 'bg-white/5 text-white/30'}`}>
                      {open ? daysLeft(q.closes_at) : 'Closed'}
                    </span>
                  </div>
                  {q.description && (
                    <p className="text-xs text-white/40 mb-4">{q.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {[q.option_1, q.option_2, q.option_3, q.option_4].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-goat text-xs font-bold shrink-0">{i + 1}</span>
                        <span className="text-sm text-white/70 truncate">{opt}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-goat mt-4 text-right">
                    {open ? 'Vote now →' : 'See results →'}
                  </p>
                </a>
              )
            })
          )}
        </div>
      </main>
    </>
  )
}
