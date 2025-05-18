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
    fetchDuel() // ✅ nuevo duelo completo
    fetchRanking(limit)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-center">
      <h1 className="text-3xl font-bold mb-6">Vote 4 GOAT 🐐</h1>
      {duel.length === 2 && (
        <div className="flex flex-col md:flex-row justify-center gap-8 mb-8">
          {duel.map((player, idx) => (
            <div key={player.id} className="bg-white rounded-2xl shadow-lg p-4 w-full md:w-64">
              <img
                src={player.image_url}
                alt={player.name}
                className="w-full h-64 object-cover rounded-xl mb-2"
              />
              <h2 className="text-xl font-semibold mb-1">{player.name}</h2>
              <div className="mb-2">
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
                className="bg-black text-white rounded-xl px-4 py-2 mt-2"
                onClick={() => vote(player.id, duel[1 - idx].id)}
              >
                Vote
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Top {limit} Ranking</h2>
      <table className="mx-auto bg-white rounded-xl shadow-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Player</th>
            <th className="px-4 py-2">Rating</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((player, i) => (
            <tr key={player.id} className="border-t">
              <td className="px-4 py-2">{i + 1}</td>
              <td className="px-4 py-2">{player.name}</td>
              <td className="px-4 py-2">{Math.round(player.rating)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ranking.length >= limit && (
        <button
          className="mt-4 text-blue-500 underline"
          onClick={() => {
            const newLimit = limit + 10
            setLimit(newLimit)
            fetchRanking(newLimit)
          }}
        >
          Show more
        </button>
      )}
    </main>
  )
}
