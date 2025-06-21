import { useEffect, useState } from 'react'
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

  const ENTITY_CATEGORY_ID = 1

  useEffect(() => {
    fetchDuel()
    fetchRanking(limit)
  }, [duelLimit])

  const fetchDuel = async () => {
    setSelected(null)
    const { data } = await supabase.rpc('get_duel', {
      entity_category_input: ENTITY_CATEGORY_ID,
      limit_rank: duelLimit
    })
    setDuel(data)
  }

  const fetchRanking = async (top) => {
    const { data } = await supabase
      .from('entity_rankings')
      .select('id, elo_rating, entity_id, entities (name, name_line1, name_line2, name_line3, image_url)')
      .eq('entity_category_id', ENTITY_CATEGORY_ID)
      .order('elo_rating', { ascending: false })
      .limit(top)

    setRanking(data)
  }

  const vote = async (winnerId, loserId) => {
    setSelected(winnerId)
    await supabase.rpc('vote_and_update_elo', {
      winner_id_input: winnerId,
      loser_id_input: loserId
    })
    fetchDuel()
    fetchRanking(limit)
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-2 text-center text-white font-sans flex flex-col">

      {/* HEADER */}
<header className="flex flex-row items-center justify-between px-4 py-3">
  {/* Logo + nombre */}
  <a href="/" className="flex flex-row items-center gap-2">
    <img src="/logo.png" alt="logo" className="h-10 w-10 sm:h-12 sm:w-12" />
    <span className="text-lg sm:text-2xl font-bold">
      Vote<span className="text-goat">4</span>GOAT
    </span>
  </a>

  {/* Navegación */}
  <nav className="flex items-center gap-4 text-sm sm:text-base">
    <a href="/about" className="hover:underline">About</a>
    <a href="/login" className="hover:underline">Log In</a>
    <a
      href="/signup"
      className="bg-goat text-black px-3 py-1 rounded-full font-semibold hover:brightness-105"
    >
      Sign Up
    </a>
  </nav>
</header>


      {/* TÍTULO */}
      <h1 className="text-3xl font-extrabold mt-2 mb-2 text-goat">WHO IS THE GOAT?</h1>

      {/* BOTONES DE SELECCIÓN */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          className={`px-3 py-1 rounded-full text-sm ${duelLimit === null ? 'bg-goat text-white' : 'bg-white text-black'}`}
          onClick={() => setDuelLimit(null)}
        >
          All Players
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm ${duelLimit === 100 ? 'bg-goat text-white' : 'bg-white text-black'}`}
          onClick={() => setDuelLimit(100)}
        >
          Top 100
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm ${duelLimit === 50 ? 'bg-goat text-white' : 'bg-white text-black'}`}
          onClick={() => setDuelLimit(50)}
        >
          Top 50
        </button>
      </div>

      {/* DUEL */}
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
      
      {/* Línea 1 (arriba) */}
      <div className="text-xs font-medium tracking-wide text-white h-4">
        {player.name_line1 || <span className="opacity-0 pointer-events-none">-</span>}
      </div>

      {/* Línea 2 (nombre central, siempre visible) */}
      <div className="text-xl font-extrabold text-goat h-6">
        {player.name_line2}
      </div>

      {/* Línea 3 (abajo) */}
      <div className="text-xs font-medium text-white h-4">
        {player.name_line3 || <span className="opacity-0 pointer-events-none">-</span>}
      </div>
      
    </div>
  ))}
</div>

        </section>
      )}

      {/* BOTÓN HELP */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="text-sm text-white underline mb-4 mt-8"
      >
        How does it work?
      </button>

      {showHelp && (
        <div className="max-w-xl mx-auto text-sm bg-white/5 text-white p-4 rounded-xl mb-4 border border-white/10">
          <p className="mb-2 font-semibold text-goat">🧠 It’s simple:</p>
          <ul className="list-disc list-inside space-y-1 text-left">
            <li>Two players appear randomly on screen.</li>
            <li>You vote for who you think is the better one.</li>
            <li>Their Elo ratings update after each vote.</li>
            <li>Scroll down to see the live ranking.</li>
          </ul>
        </div>
      )}

      {/* RANKING */}
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
