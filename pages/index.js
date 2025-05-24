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
    <main className="min-h-screen bg-background px-4 py-8 text-center text-white font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-goat">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="logo" className="h-20 w-20" />
          <span className="text-3xl font-bold">
  D<span className="text-goat">V</span>EL<span className="text-goat">S</span>
</span>
        </div>
        <nav className="flex gap-4">
  <img src="/icons/football_logo.svg" alt="Football" className="h-5 w-5" />
  <img src="/icons/basketball_logo.svg" alt="Basketball" className="h-5 w-5" />
  <img src="/icons/tennis_logo.svg" alt="Tennis" className="h-5 w-5" />
  <img src="/icons/chess_logo.svg" alt="Chess" className="h-5 w-5" />
  <img src="/icons/formula1_logo.svg" alt="F1" className="h-5 w-5" />
  <img src="/icons/golf_logo.svg" alt="Golf" className="h-5 w-5" />
  <img src="/icons/nfl_logo.svg" alt="NFL" className="h-5 w-5" />
  <img src="/icons/cycling_logo.svg" alt="Cycling" className="h-5 w-5" />
  <img src="/icons/moto_logo.svg" alt="MotoGP" className="h-5 w-5" />
  <img src="/icons/boxing_logo.svg" alt="Boxing" className="h-5 w-5" />
</nav>
      </header>

      <h1 className="text-4xl font-extrabold mt-10 mb-6 text-goat">WHO IS THE GOAT?</h1>

      {duel.length === 2 && (
        <section className="flex flex-col items-center justify-center px-4 py-12">
          <div className="flex items-center gap-6">
            <PlayerCard player={duel[0]} onVote={() => vote(duel[0].id, duel[1].id)} />
            <div className="text-goat text-4xl font-extrabold">VS</div>
            <PlayerCard player={duel[1]} onVote={() => vote(duel[1].id, duel[0].id)} />
          </div>
        </section>
      )}

      <div id="ranking-section" className="bg-white text-black px-6 py-12 mt-8 rounded-t-3xl shadow-inner">
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
    <button
      onClick={onVote}
      className="bg-white shadow-md rounded-2xl p-4 w-full md:w-64 h-[350px] flex flex-col items-center justify-between transition hover:scale-105 hover:ring-4 hover:ring-goat focus:outline-none cursor-pointer"
    >
      {player.image_url ? (
        <img
          src={player.image_url}
          alt={player.name}
          className="w-40 h-40 object-cover rounded-xl mb-4 border"
        />
      ) : (
        <div className="w-40 h-40 bg-gray-200 rounded-xl mb-4 border flex items-center justify-center text-gray-500 text-xs">
          No image
        </div>
      )}
      <div className="text-sm font-medium tracking-wide text-gray-700">{firstName.toUpperCase()}</div>
      <div className="text-2xl font-extrabold text-gray-900">{lastName.toUpperCase()}</div>
      <div>
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
    </button>
  )
}

