import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [duel, setDuel] = useState([])
  const [ranking, setRanking] = useState([])
  const [limit, setLimit] = useState(20)
  const [selected, setSelected] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [duelLimit, setDuelLimit] = useState(null)
  const [user, setUser] = useState(null)
  const [ipAddress, setIpAddress] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [voting, setVoting] = useState(false)
  const [topElo, setTopElo] = useState(1)

  const ENTITY_CATEGORY_ID = 2
  const menuRef = useRef()
  const helpRef = useRef()

  useEffect(() => {
    fetchDuel()
    fetchRanking(20)
    checkUser()
    fetchIp()
  }, [duelLimit])

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

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      setIpAddress(data.ip)
    } catch (e) {
      console.warn('Could not get IP:', e)
    }
  }

  const fetchDuel = async () => {
    setSelected(null)
    const { data, error } = await supabase.rpc('get_duel', {
      entity_category_input: ENTITY_CATEGORY_ID,
      limit_rank: duelLimit,
    })
    if (error) console.error('Error in fetchDuel:', error)
    setDuel(data || [])
  }

  const fetchRanking = async (top) => {
    const { data, error } = await supabase
      .from('entity_rankings')
      .select('id, elo_rating, entities (name, name_line1, name_line2, name_line3, image_url)')
      .eq('entity_category_id', ENTITY_CATEGORY_ID)
      .order('elo_rating', { ascending: false })
      .limit(top)
    if (error) console.error('Error in fetchRanking:', error)
    const results = data || []
    setRanking(results)
    if (results.length > 0) setTopElo(results[0].elo_rating)
  }

  const vote = async (winnerId, loserId) => {
    if (voting) return
    setSelected(winnerId)
    setVoting(true)
    const { error } = await supabase.rpc('vote_and_update_elo_basketball', {
      winner_id_input: winnerId,
      loser_id_input: loserId,
      ip_address_input: ipAddress
    })
    if (error) {
      console.error('ERROR voting:', error)
      setVoting(false)
      setSelected(null)
      return
    }
    await new Promise(resolve => setTimeout(resolve, 800))
    await fetchDuel()
    await fetchRanking(limit)
    setVoting(false)
  }

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

        <div className="flex justify-center gap-4 mt-2 mb-2">
          <a href="/football" title="Football"><img src="/icons/football_logo.png" alt="Football" className="h-8 w-8 sm:h-10 sm:w-10" /></a>
          <a href="/basketball" title="Basketball"><img src="/icons/basketball_logo.png" alt="Basketball" className="h-8 w-8 sm:h-10 sm:w-10" /></a>
          <div title="Coming Soon" className="opacity-40 cursor-not-allowed"><img src="/icons/tennis_logo.png" alt="Tennis" className="h-8 w-8 sm:h-10 sm:w-10" /></div>
        </div>

        {showHelp && (
          <div ref={helpRef} className="max-w-xl mx-auto text-sm bg-white/5 text-white p-4 rounded-xl mt-2 border border-white/10">
            <p className="mb-2 font-semibold text-goat">🏀 What is Vote4GOAT?</p>
            <p className="mb-2">Everyone has an opinion on who's the greatest of all time — but what if we could let the world decide, one vote at a time?</p>
            <p className="mb-2">Vote4GOAT is a simple, fun and addicting way to settle the debate. Two players appear on screen. You choose the one you think is greater. Your vote updates their score using a ranking system based on Elo — the same method used in chess and competitive gaming.</p>
            <p className="mb-2">The more people vote, the more accurate the ranking becomes. No stats, no explanations — just pure instinct and opinion.</p>
            <p className="mt-4 font-semibold text-goat">🗳 Start voting. Shape the GOAT list.</p>
          </div>
        )}

        <h1 className="text-3xl font-extrabold mt-4 mb-1 text-goat text-center">WHO IS THE GOAT?</h1>
        <p className="text-center text-white/40 text-xs mb-3">Vote. The world decides.</p>

        <div className="max-w-xl mx-auto w-full mb-4 px-1">
          <button onClick={() => setShowHowItWorks(!showHowItWorks)} className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/70 transition">
            <span>How it works?</span>
            <span className={`transition-transform duration-200 ${showHowItWorks ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {showHowItWorks && (
            <div className="mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex justify-around gap-2">
              {[
                { icon: '👁', label: 'Two players appear' },
                { icon: '👆', label: 'You vote for the best' },
                { icon: '📈', label: 'The ranking updates' },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 text-center">
                  <div className="text-xl">{step.icon}</div>
                  <p className="text-xs text-white/50 leading-tight">{step.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-3 mb-4">
          <button className={`px-3 py-1 rounded-full text-sm border transition ${duelLimit === null ? 'bg-goat border-goat text-black font-semibold' : 'bg-transparent border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'}`} onClick={() => setDuelLimit(null)}>All Players</button>
          <button className={`px-3 py-1 rounded-full text-sm border transition ${!user ? 'border-white/10 text-white/20 cursor-not-allowed' : duelLimit === 100 ? 'bg-goat border-goat text-black font-semibold' : 'bg-transparent border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'}`} onClick={() => { if (!user) return alert('Please log in to use this filter.'); setDuelLimit(100) }} title={!user ? 'Please log in to use this filter' : ''}>Top 100</button>
          <button className={`px-3 py-1 rounded-full text-sm border transition ${!user ? 'border-white/10 text-white/20 cursor-not-allowed' : duelLimit === 50 ? 'bg-goat border-goat text-black font-semibold' : 'bg-transparent border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'}`} onClick={() => { if (!user) return alert('Please log in to use this filter.'); setDuelLimit(50) }} title={!user ? 'Please log in to use this filter' : ''}>Top 50</button>
        </div>

        {duel.length === 2 && (
          <section className="flex flex-col items-center justify-center py-4">
            <div className="relative flex flex-row items-center justify-center gap-6">
              {duel.map((player) => {
                const isWinner = selected === player.id
                const isLoser = selected !== null && selected !== player.id
                return (
                  <button
                    key={player.id}
                    onClick={() => vote(player.id, duel.find(p => p.id !== player.id).id)}
                    disabled={voting}
                    className={`
                      w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 focus:outline-none relative
                      ${!selected && !voting ? 'hover:brightness-110 hover:border-white/30' : ''}
                      ${isWinner ? 'scale-110 ring-4 ring-goat shadow-[0_0_32px_rgba(255,165,0,0.8)] brightness-110 cursor-not-allowed' : ''}
                      ${isLoser ? 'scale-90 opacity-25 brightness-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <img src={player.image_url} alt={player.name_line2 || player.name_line1} className="w-full h-full object-cover" />
                  </button>
                )
              })}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-goat text-black text-base font-black w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg">VS</div>
              </div>
            </div>
            <div className="flex flex-row justify-center gap-6 mt-3">
              {duel.map((player) => (
                <div key={player.id} className="flex flex-col items-center w-40 sm:w-56 space-y-0.5 leading-none">
                  <div className="text-xs font-medium tracking-wide text-white/50 h-4">
                    {player.name_line1 || <span className="opacity-0 pointer-events-none">-</span>}
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-goat">{player.name_line2}</div>
                  <div className="text-lg sm:text-xl font-extrabold text-goat">
                    {player.name_line3 || <span className="opacity-0 pointer-events-none">-</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div id="ranking-section" className="bg-background text-white px-4 py-8 mt-4 rounded-t-3xl">
          <div className="text-center text-sm mb-4">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-goat underline">↑ VOTE</button>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <h2 className="text-2xl font-bold">RANKING</h2>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/40 text-xs">live</span>
            </div>
          </div>
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
                {ranking.map((player, i) => {
                  const rowStyle = i === 0 ? 'bg-goat/10 font-bold' : i === 1 ? 'bg-white/5 font-semibold' : i === 2 ? 'bg-white/5' : ''
                  const nameColor = i === 0 ? 'text-goat' : i === 1 ? 'text-white/90' : i === 2 ? 'text-white/80' : 'text-white/70'
                  const barPct = Math.round((player.elo_rating / topElo) * 100)
                  const barColor = i === 0 ? 'bg-goat' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-white/20'
                  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                  return (
                    <tr key={player.id} className={`border-t border-white/5 hover:bg-white/5 transition ${rowStyle}`}>
                      <td className="pl-2 pr-1 py-2.5 text-xs text-white/40 w-8">{medal || i + 1}</td>
                      <td className="pl-1 pr-2 py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <img src={player.entities.image_url} alt={player.entities.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10" />
                          <span className={`truncate text-sm font-semibold max-w-[160px] ${nameColor}`}>{player.entities.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs text-white/40 hidden sm:table-cell w-16">{Math.round(player.elo_rating)}</td>
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
          {ranking.length >= limit && limit < 100 && (
            <button className="mt-6 text-goat underline text-sm mx-auto block" onClick={() => { const newLimit = limit + 20; setLimit(newLimit); fetchRanking(newLimit) }}>Show more</button>
          )}
        </div>
      </main>
    </>
  )
}
