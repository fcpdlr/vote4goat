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

  useEffect(() => {
    fetchDuel()
    fetchRanking(limit)
  }, [])

  const fetchDuel = async () => {
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
    await supabase.rpc('vote_and_update_elo', {
      winner_id_input: winnerId,
      loser_id_input: loserId
    })
    fetchDuel()
    fetchRanking(limit)
  }

  return (
    <main className="min-h-screen bg-[#D9DEE4] px-4 py-8 text-center text-black">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="h-8 w-8" />
          <span className="text-2xl font-bold">DUELS</span>
        </div>
        <nav className="flex gap-4">
          <img src="/icons/football.svg" alt="Football" className="h-5 w-5" />
          <img src="/icons/basketball.svg" alt="Basketball" className="h-5 w-5" />
          <img src="/icons/tennis.svg" alt="Tennis" className="h-5 w-5" />
        </nav>
      </header>

      {duel.length === 2 && (
        <section className="flex flex-col items-center justify-center px-4 py-12">
          <div className="flex items-center gap-6">
            <PlayerCard player={duel[0]} onVote={() => vote(duel[0].id, duel[1].id)} />
            <div className="text-[#D98C3F] text-4xl font-extrabold">VS</div>
            <PlayerCard player={duel[1]} onVote={() => vote(duel[1].id, duel[0].id)} />
          </div>
        </section>
      )}

      <div id="ranking-section" className="bg-white px-6 py-12 mt-8 rounded-t-3xl shadow-inner">
        <h2 className="text-2xl font-bold mb-6">Top {limit} Ranking</h2>

        <div className="overflow-x-auto">
          <table className="mx-auto bg-white rounded-xl shadow-md text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2">Country</th>
                <th className="px-4 py-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player, i) => (
                <tr key={player.id} className="border-t">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{player.name}</td>
                  <td className="px-4 py-2">
                    {player.country_primary && (
                      <img
                        className="inline-block h-5 w-5"
                        src={`https://flagcdn.com/h40/${player.country_primary.toLowerCase()}.png`}
                      />
                    )}
                    {player.country_secondary && (
                      <img
                        className="inline-block h-5 w-5 ml-1"
                        src={`https://flagcdn.com/h40/${player.country_secondary.toLowerCase()}.png`}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">{Math.round(player.rating)}</td>
                </tr>
              ))}
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

function PlayerCard({ player, onVote }) {
  const [firstName, ...lastNameParts] = player.name.split(" ")
  const lastName = lastNameParts.join(" ")

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 w-full md:w-64 flex flex-col items-center">
      <img
        src={player.image_url}
        alt={player.name}
        className="w-40 h-40 object-cover rounded-xl mb-4 border"
      />
      <div className="text-sm font-medium tracking-wide">{firstName.toUpperCase()}</div>
      <div className="text-2xl font-extrabold mb-2">{lastName.toUpperCase()}</div>
      <div className="mb-4">
        {player.country_primary && (
          <img
            className="inline-block h-5 w-5"
            src={`https://flagcdn.com/h40/${player.country_primary.toLowerCase()}.png`}
          />
        )}
        {player.country_secondary && (
          <img
            className="inline-block h-5 w-5 ml-1"
            src={`https://flagcdn.com/h40/${player.country_secondary.toLowerCase()}.png`}
          />
        )}
      </div>
      <button
        className="bg-[#D98C3F] hover:opacity-90 text-white text-sm px-4 py-2 rounded-full"
        onClick={onVote}
      >
        Vote
      </button>
    </div>
  )
}
