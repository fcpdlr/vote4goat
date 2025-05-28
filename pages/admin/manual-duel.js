import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ManualDuel() {
  const router = useRouter()
  const { id1, id2 } = router.query

  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)

  useEffect(() => {
    if (id1 && id2) {
      fetchPlayers()
    }
  }, [id1, id2])

  const fetchPlayers = async () => {
    const { data: players } = await supabase
      .from('players')
      .select('id, name, image_url')
      .in('id', [id1, id2])

    alert(JSON.stringify(players, null, 2)) // 👈 DEBUG: vemos lo que llega

    if (players) {
      setPlayer1(players.find(p => String(p.id) === String(id1)))
      setPlayer2(players.find(p => String(p.id) === String(id2)))
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center text-white px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
        {player1 ? (
          <img
            src={player1.image_url}
            alt={player1.name}
            className="w-40 h-40 md:w-64 md:h-64 object-cover rounded-xl border"
          />
        ) : (
          <div className="w-40 h-40 md:w-64 md:h-64 bg-gray-700 rounded-xl flex items-center justify-center text-white text-xs">
            No Image
          </div>
        )}

        <div className="text-goat text-2xl md:text-4xl font-bold absolute md:static top-1/2 -translate-y-1/2 z-10 bg-background px-4 py-2 rounded-full border border-goat">
          VS
        </div>

        {player2 ? (
          <img
            src={player2.image_url}
            alt={player2.name}
            className="w-40 h-40 md:w-64 md:h-64 object-cover rounded-xl border"
          />
        ) : (
          <div className="w-40 h-40 md:w-64 md:h-64 bg-gray-700 rounded-xl flex items-center justify-center text-white text-xs">
            No Image
          </div>
        )}
      </div>
    </main>
  )
}
