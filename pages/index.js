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

  useEffect(() => {
    fetchDuel()
    fetchRanking(limit)
  }, [])

  const fetchDuel = async () => {
    setSelected(null)
    const { data } = await supabase.rpc('get_duel')
    setDuel(data)
  }

  const fetchRanking = async (top) => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('rating', { ascending: false })
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
      
      <header className="flex flex-col items-center justify-center pt-2 pb-4 gap-4">
        {/* Logo */}
        <a href="/" className="flex flex-col items-center">
          <img src="/logo.png" alt="logo" className="h-20 w-20 mb-1" />
          <span className="text-2xl font-bold">Vote<span className="text-goat">4</span>GOAT</span>
        </a>

        {/* Iconos */}
        <div className="flex flex-row items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <a href="/football">
              <img src="/icons/football_logo.png" alt="Football" className="h-10 w-10 mb-1" />
            </a>
            <span className="text-goat font-semibold text-xs uppercase">Football</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/icons/basketball_logo.png" alt="Basketball" className="h-10 w-10 mb-1 opacity-60 cursor-default" />
            <span className="text-goat font-semibold text-xs uppercase">Basketball</span>
            <span className="text-xs text-white/50 mt-1 italic">Coming soon</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/icons/tennis_logo.png" alt="Tennis" className="h-10 w-10 mb-1 opacity-60 cursor-default" />
            <span className="text-goat font-semibold text-xs uppercase">Tennis</span>
            <span className="text-xs text-white/50 mt-1 italic">Coming soon</span>
          </div>
        </div>
      </header>

      <h1 className="text-3xl font-extrabold mt-4 mb-4 text-goat">WHO IS THE GOAT?</h1>

      {duel.length === 2 && (
        <section className="flex flex-col items-center justify-center px-4 py-10 relative grow min-h-[calc(100vh-320px)]">
          <div className="relative flex items-center justify-center gap-4 min-h-[288px]">
            <PlayerCard
              player={duel[0]}
              onVote={() => vote(duel[0].id, duel[1].id)}
              selected={selected === duel[0].id}
            />
            <div className="absolute inset-y-0 left-1/2 flex items-center justify-center -translate-x-1/2 z-10">
              <div className="bg-goat text-white text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-lg">
                VS
              </div>
            </div>
            <PlayerCard
              player={duel[1]}
              onVote={() => vote(duel[1].id, duel[0].id)}
              selected={selected === duel[1].id}
            />
          </div>

          <button
            onClick={() => document.getElementById('ranking-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-6 text-white underline text-sm"
          >
            RANKING ↓
          </button>
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
                    <td className="px-4 py-2 text-white font-semibold text-center">{player.name}</td>
                    <td className="px-4 py-2">{Math.round(player.rating)}</td>
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

function PlayerCard({ player, onVote, selected }) {
  return (
    <button onClick={onVote} className="cursor-pointer transition focus:outline-none">
      <div className="flex flex-col items-center justify-start w-44 h-72">
        <div className="w-40 h-40 rounded-xl overflow-hidden border mx-auto transition duration-200 ease-in-out hover:brightness-110">
          <img
            src={player.image_url}
            alt={player.name}
            className={`w-full h-full object-cover ${selected ? 'ring-4 ring-goat' : ''}`}
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full h-[96px] mt-2 space-y-1">
          {player.name_line1 && (
            <div className="text-xs font-medium tracking-wide text-white leading-none">
              {player.name_line1}
            </div>
          )}
          <div className="text-xl font-extrabold text-goat leading-none">
            {player.name_line2}
          </div>
          {player.name_line3 && (
            <div className="text-xs font-medium text-white leading-none">
              {player.name_line3}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
