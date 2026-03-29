import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [user, setUser] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [activeMode, setActiveMode] = useState('dvels')
  const [activeSport, setActiveSport] = useState('all')
  const [ranking, setRanking] = useState([])
  const [activeRank4, setActiveRank4] = useState(null)
  const [topElo, setTopElo] = useState(1)

  const menuRef = useRef()
  const helpRef = useRef()

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
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {}
    }
    checkUser()
  }, [])

  useEffect(() => {
    const fetchRanking = async () => {
      const categoryId = activeSport === 'basketball' ? 2 : 1
      const { data } = await supabase
        .from('entity_rankings')
        .select('id, elo_rating, entities (name, image_url)')
        .eq('entity_category_id', categoryId)
        .order('elo_rating', { ascending: false })
        .limit(5)
      const results = data || []
      setRanking(results)
      if (results.length > 0) setTopElo(results[0].elo_rating)
    }
    if (activeMode === 'dvels') fetchRanking()
  }, [activeMode, activeSport])

  useEffect(() => {
    const fetchActiveRank4 = async () => {
      const { data } = await supabase
        .from('rank4_questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setActiveRank4(data)
    }
    fetchActiveRank4()
  }, [])

  const modes = [
    { id: 'dvels', sports: ['football', 'basketball', 'tennis'] },
    { id: 'tops', sports: ['football'] },
    { id: 'rank', sports: ['football'] },
  ]

  const isModeAvailable = (modeId) => {
    if (activeSport === 'all') return true
    const mode = modes.find(m => m.id === modeId)
    return mode?.sports.includes(activeSport)
  }

  const getDvelsHref = () => {
    if (activeSport === 'basketball') return '/basketball'
    return '/football'
  }

  const medal = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

  return (
    <>
      <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">

        <header className="flex items-center justify-between px-3 py-2">
          <span className="text-xl sm:text-2xl font-bold text-white">Vote4GOAT</span>
          <nav className="flex items-center gap-3 text-xs sm:text-sm">
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

        {showHelp && (
          <div ref={helpRef} className="max-w-xl mx-auto text-sm bg-white/5 text-white p-4 rounded-xl mt-2 border border-white/10">
            <p className="mb-2 font-semibold text-goat">What is Vote4GOAT?</p>
            <p className="mb-2">Everyone has an opinion on who's the greatest of all time. Vote4GOAT lets the world decide — through duels, Top 10 lists, and weekly rankings.</p>
            <p className="mt-4 font-semibold text-goat">🗳 Start voting. Shape the GOAT list.</p>
          </div>
        )}

        {/* HERO */}
        <div className="text-center pt-10 pb-6 px-4">
          <p className="text-xs tracking-widest uppercase text-white/30 mb-3">The world decides</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
            Who is the <span className="text-goat">GOAT?</span>
          </h1>
          <p className="text-sm text-white/40 max-w-sm mx-auto">Vote, rank and debate. The only place where the world settles the argument.</p>
        </div>

        {/* SPORT FILTER */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {[
            { id: 'all', label: 'All sports' },
            { id: 'football', label: '⚽ Football' },
            { id: 'basketball', label: '🏀 Basketball' },
            { id: 'tennis', label: '🎾 Tennis' },
          ].map(sport => (
            <button
              key={sport.id}
              onClick={() => { setActiveSport(sport.id); setActiveMode('dvels') }}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                activeSport === sport.id
                  ? 'border-goat text-goat bg-goat/5'
                  : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
              }`}
            >
              {sport.label}
            </button>
          ))}
        </div>

        {/* MODES BAR */}
        <div className="max-w-lg mx-auto w-full px-1 mb-6">
          <div className="flex border border-white/10 rounded-2xl overflow-hidden">
            {[
              { id: 'dvels', logo: ['D','V','E','L','S'], accent: [1,4] },
              { id: 'tops', logo: ['T','1','0','P','S'], accent: [1,2] },
              { id: 'rank', logo: ['R','4','N','K'], accent: [1] },
            ].map((mode, idx) => {
              const available = isModeAvailable(mode.id)
              const active = activeMode === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => available && setActiveMode(mode.id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-4 transition relative
                    ${active ? 'bg-white/5' : 'bg-background hover:bg-white/[0.03]'}
                    ${!available ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                    ${idx > 0 ? 'border-l border-white/10' : ''}
                  `}
                >
                  {/* Logo */}
                  <div className="text-2xl sm:text-3xl font-black tracking-wider leading-none" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    {mode.logo.map((letter, i) => (
                      <span key={i} className={mode.accent.includes(i) ? 'text-goat' : 'text-white'}>
                        {letter}
                      </span>
                    ))}
                  </div>
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-goat rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* CONTENT PANELS */}
        <div className="max-w-lg mx-auto w-full px-1 flex-1">

          {/* DVELS panel */}
          {activeMode === 'dvels' && (
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-sm font-semibold text-white mb-1">Two players. You choose.</p>
                <p className="text-xs text-white/40 mb-4">Vote in 1v1 duels and shape the all-time ranking. Every vote counts.</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-goat/10 text-goat">⚽ Football</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-goat/10 text-goat">🏀 Basketball</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/30">🎾 Tennis — soon</span>
                </div>
                <a
                  href={getDvelsHref()}
                  className="block w-full py-2.5 rounded-xl text-sm font-bold text-center bg-goat text-black hover:brightness-110 transition"
                >
                  Start voting →
                </a>
              </div>

              {/* Mini ranking */}
              {ranking.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                      Current ranking — {activeSport === 'basketball' ? 'Basketball' : 'Football'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-white/30">live</span>
                    </div>
                  </div>
                  {ranking.map((player, i) => {
                    const barPct = Math.round((player.elo_rating / topElo) * 100)
                    const barColor = i === 0 ? 'bg-goat' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-white/20'
                    return (
                      <div key={player.id} className={`flex items-center gap-3 px-4 py-2.5 border-t border-white/5 ${i === 0 ? 'bg-goat/5' : ''}`}>
                        <span className="text-xs w-5 text-center shrink-0 text-white/40">{medal(i) || i + 1}</span>
                        <img src={player.entities.image_url} alt={player.entities.name} className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/10" />
                        <span className={`flex-1 text-sm font-medium truncate ${i === 0 ? 'text-goat' : 'text-white/80'}`}>{player.entities.name}</span>
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden shrink-0">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barPct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  <div className="px-4 py-3 border-t border-white/5">
                    <a href={getDvelsHref()} className="text-xs text-goat hover:underline">See full ranking →</a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* T0PS panel */}
          {activeMode === 'tops' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-sm font-semibold text-white mb-1">Build your all-time Top 10.</p>
              <p className="text-xs text-white/40 mb-4">Pick a club or national team, drag your 10 players into order, and see how your list compares with the world.</p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-xs px-2 py-1 rounded-full bg-goat/10 text-goat">⚽ Football</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/30">🏀 Basketball — soon</span>
              </div>
              
                href="/top10"
                className="block w-full py-2.5 rounded-xl text-sm font-bold text-center bg-goat text-black hover:brightness-110 transition"
              >
                Build your Top 10 →
              </a>
            </div>
          )}

          {/* R4NK panel */}
          {activeMode === 'rank' && (
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-sm font-semibold text-white mb-1">One question. Four players. One week.</p>
                <p className="text-xs text-white/40 mb-4">Every week a new R4NK drops. Order the 4 from best to worst. When it closes, the world's verdict is revealed.</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-goat/10 text-goat">⚽ Football</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/30">🏀 Basketball — soon</span>
                </div>
                
                  href="/rank4"
                  className="block w-full py-2.5 rounded-xl text-sm font-bold text-center bg-goat text-black hover:brightness-110 transition"
                >
                  See all R4NKs →
                </a>
              </div>

              {/* R4NK activo */}
              {activeRank4 && (
                
                  href={`/rank4/${activeRank4.id}`}
                  className="block bg-white/5 border border-goat/20 rounded-2xl p-5 hover:border-goat/40 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-goat font-semibold uppercase tracking-wide">This week</span>
                    <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">Open</span>
                  </div>
                  <p className="text-base font-semibold text-white mb-3">{activeRank4.title}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[activeRank4.option_1, activeRank4.option_2, activeRank4.option_3, activeRank4.option_4].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-goat text-xs font-bold shrink-0">{i + 1}</span>
                        <span className="text-xs text-white/60 truncate">{opt}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-goat mt-3 text-right">Vote now →</p>
                </a>
              )}
            </div>
          )}

        </div>

        <div className="h-10" />
      </main>
    </>
  )
}
