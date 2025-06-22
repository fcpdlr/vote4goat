import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [duel, setDuel] = useState([])
  const [ranking, setRanking] = useState([])
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [duelLimit, setDuelLimit] = useState(null)
  const [user, setUser] = useState(null)
  const [ipAddress, setIpAddress] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  const ENTITY_CATEGORY_ID = 1

  const menuRef = useRef()
  const helpRef = useRef()

  useEffect(() => {
    fetchDuel()
    fetchRanking(limit)
    checkUser()
    fetchIp()
  }, [duelLimit])

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

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      setIpAddress(data.ip)
    } catch (e) {
      console.warn('No se pudo obtener la IP:', e)
    }
  }

  const fetchDuel = async () => {
    setSelected(null)
    const { data, error } = await supabase.rpc('get_duel', {
      entity_category_input: ENTITY_CATEGORY_ID,
      limit_rank: duelLimit,
    })
    if (error) {
      console.error('Error en fetchDuel:', error)
    }
    setDuel(data || [])
    console.log('DUELO:', data)
  }

  const fetchRanking = async (top) => {
    const { data, error } = await supabase
      .from('entity_rankings')
      .select(
        'id, elo_rating, id, entities (name, name_line1, name_line2, name_line3, image_url)'
      )
      .eq('entity_category_id', ENTITY_CATEGORY_ID)
      .order('elo_rating', { ascending: false })
      .limit(top)

    if (error) {
      console.error('Error en fetchRanking:', error)
    }

    setRanking(data || [])
  }

  const vote = async (winnerId, loserId) => {
    setSelected(winnerId)

let userId = null
let ip = null

try {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  userId = user?.id || null
  console.log('🧑‍💻 USER ID DETECTADO:', userId)
} catch (err) {
  console.error('⚠️ Error al obtener el user ID:', err)
}


    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      ip = data.ip
    } catch {}

    console.log('➡️ ENVIANDO A vote_and_update_elo', {
      winner_id_input: winnerId,
      loser_id_input: loserId,
      user_id_input: userId,
      ip_address_input: ip
    })

    const { error } = await supabase.rpc('vote_and_update_elo', {
      winner_id_input: winnerId,
      loser_id_input: loserId,
      user_id_input: userId,
      ip_address_input: ip
    })

    if (error) {
      console.error('❌ ERROR al votar:', error)
      return
    }

    fetchDuel()
    fetchRanking(limit)
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">
      <header className="flex items-center justify-between px-3 py-2">
        <a href="/" className="flex items-center gap-1">
          <img src="/logo.png" alt="logo" className="h-8 w-8 sm:h-10 sm:w-10" />
          <span className="text-base sm:text-xl font-bold leading-none">
            Vote<span className="text-goat">4</span>GOAT
          </span>
        </a>

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
              <a href="/login" className="hover:underline">
                Log In
              </a>
              <a
                href="/signup"
                className="bg-goat text-black px-2 py-1 rounded-full font-semibold hover:brightness-105"
              >
                Sign Up
              </a>
            </>
          )}
        </nav>
      </header>

      {showHelp && (
        <div ref={helpRef} className="max-w-xl mx-auto text-sm bg-white/5 text-white p-4 rounded-xl mt-2 border border-white/10">
          <p className="mb-2 font-semibold text-goat">⚽ What is Vote4GOAT?</p>
          <p className="mb-2">
            Everyone has an opinion on who’s the greatest of all time — but what if we could let the world decide, one vote at a time?
          </p>
          <p className="mb-2">
            Vote4GOAT is a simple, fun and addicting way to settle the debate. Two players appear on screen. You choose the one you think is greater. Your vote updates their score using a ranking system based on Elo — the same method used in chess and competitive gaming.
          </p>
          <p className="mb-2">
            The more people vote, the more accurate the ranking becomes. No stats, no explanations — just pure instinct and opinion.
          </p>
          <p className="mt-4 font-semibold text-goat">🗳 Start voting. Shape the GOAT list.</p>
        </div>
      )
      }
      <h1 className="text-3xl font-extrabold mt-4 mb-2 text-goat text-center">WHO IS THE GOAT?</h1>

<div className="flex justify-center space-x-4 mb-4">
  <button
    className={`px-3 py-1 rounded-full text-sm ${
      duelLimit === null ? 'bg-goat text-white' : 'bg-white text-black'
    }`}
    onClick={() => setDuelLimit(null)}
  >
    All Players
  </button>

  <button
    className={`px-3 py-1 rounded-full text-sm ${
      !user
        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
        : duelLimit === 100
        ? 'bg-goat text-white'
        : 'bg-white text-black'
    }`}
    onClick={() => {
      if (!user) {
        alert('Please log in to use this filter.')
        return
      }
      setDuelLimit(100)
    }}
    disabled={!user}
    title={!user ? 'Please log in to use this filter' : ''}
  >
    Top 100
  </button>

  <button
    className={`px-3 py-1 rounded-full text-sm ${
      !user
        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
        : duelLimit === 50
        ? 'bg-goat text-white'
        : 'bg-white text-black'
    }`}
    onClick={() => {
      if (!user) {
        alert('Please log in to use this filter.')
        return
      }
      setDuelLimit(50)
    }}
    disabled={!user}
    title={!user ? 'Please log in to use this filter' : ''}
  >
    Top 50
  </button>
</div>

      {duel.length === 2 && (
        <section className="flex flex-col items-center justify-center py-4">
          <div className="relative flex flex-row items-center justify-center gap-6 h-40">
            <button onClick={() => vote(duel[0].id, duel[1].id)} className="w-40 h-40 rounded-xl overflow-hidden border transition hover:brightness-110 focus:outline-none relative">
              <img
                src={duel[0].image_url}
                alt={duel[0].name_line2 || duel[0].name_line1}
                className={`w-full h-full object-cover transition duration-300 ease-in-out ${selected === duel[0].id ? 'scale-110 ring-4 ring-goat z-10 shadow-[0_0_20px_rgba(255,165,0,0.8)]' : ''}`}
              />
            </button>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-goat text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-full shadow-lg">
                VS
              </div>
            </div>

            <button onClick={() => vote(duel[1].id, duel[0].id)} className="w-40 h-40 rounded-xl overflow-hidden border transition hover:brightness-110 focus:outline-none relative">
              <img
                src={duel[1].image_url}
                alt={duel[1].name_line2 || duel[1].name_line1}
                className={`w-full h-full object-cover transition duration-300 ease-in-out ${selected === duel[1].id ? 'scale-110 ring-4 ring-goat z-10 shadow-[0_0_20px_rgba(255,165,0,0.8)]' : ''}`}
              />
            </button>
          </div>

          <div className="flex flex-row justify-center gap-6 mt-2">
            {[duel[0], duel[1]].map((player) => (
              <div key={player.id} className="flex flex-col items-center w-44 space-y-1 leading-none">
                <div className="text-xs font-medium tracking-wide text-white h-4">
                  {player.name_line1 || <span className="opacity-0 pointer-events-none">-</span>}
                </div>
                <div className="text-xl font-extrabold text-goat h-6">
                  {player.name_line2}
                </div>
                <div className="text-xs font-medium text-white h-4">
                  {player.name_line3 || <span className="opacity-0 pointer-events-none">-</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div id="ranking-section" className="bg-background text-white px-6 py-12 mt-8 rounded-t-3xl">
        <div className="text-center text-sm mb-2">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-goat underline">↑ VOTE</button>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">RANKING</h2>
        <div className="overflow-x-auto">
          <table className="mx-auto w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-goat text-left">RANK</th>
                <th className="px-4 py-2 text-goat text-center">PLAYER</th>
                <th className="px-4 py-2 text-goat text-left">POINTS</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player, i) => {
                const rowStyle =
                  i === 0
                    ? 'bg-goat/10 font-bold text-goat'
                    : i === 1
                    ? 'bg-goat/5 font-semibold text-goat/90'
                    : i === 2
                    ? 'bg-goat/5 text-goat/80'
                    : ''
                return (
                  <tr key={player.id} className={`border-t border-goat/30 hover:bg-white/5 transition ${rowStyle}`}>
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2 text-white font-semibold text-center">
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src={player.entities.image_url}
                          alt={player.entities.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{player.entities.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{Math.round(player.elo_rating)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {ranking.length >= limit && limit < 50 && (
          <button
            className="mt-6 text-blue-600 underline text-sm"
            onClick={() => {
              const newLimit = limit + 10
              setLimit(newLimit)
              fetchRanking(newLimit)
            }}
          >
            Show more
          </button>
        )}
      </div>
    </main>
  )
}
