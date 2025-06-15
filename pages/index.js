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
      <header className="flex flex-col items-center justify-start pt-2 pb-4 gap-4">
        <a href="/" className="flex flex-col items-center">
          <img src="/logo.png" alt="logo" className="h-20 w-20 mb-1" />
          <span className="text-2xl font-bold">Vote<span className="text-goat">4</span>GOAT</span>
        </a>
      </header>

      <h1 className="text-3xl font-extrabold mt-2 mb-2 text-goat">WHO IS THE GOAT?</h1>

      {duel.length === 2 && (
        <section className="flex flex-col items-center justify-center flex-grow relative">
          <div className="relative flex items-start justify-center gap-6">
            <PlayerCard
              player={duel[0]}
              onVote={() => vote(duel[0].id, duel[1].id)}
              selected={selected === duel[0].id}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80px] z-10">
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
        </section>
      )}
    </main>
  )
}

function PlayerCard({ player, onVote, selected }) {
  return (
    <button onClick={onVote} className="cursor-pointer transition focus:outline-none">
      <div className="flex flex-col items-center w-44">
        <div className={`player-image-block w-40 h-40 relative rounded-xl overflow-hidden border mx-auto transition duration-300 ease-in-out hover:brightness-110 ${selected ? 'scale-110 ring-4 ring-goat z-10' : ''}`}>
          <img
            src={player.image_url}
            alt={player.name_line2 || player.name_line1}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full mt-2 space-y-1 h-[96px]">
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
