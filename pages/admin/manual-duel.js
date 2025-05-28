import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ManualDuel() {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id1 = urlParams.get('id1')
    const id2 = urlParams.get('id2')

    if (id1 && id2) {
      fetchPlayers([id1, id2])
    }
  }, [])

  const fetchPlayers = async (ids) => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, image_url')
      .in('id', ids)

    if (error) {
      console.error('Error fetching players:', error)
    } else {
      setPlayers(data)
    }
  }

  if (players.length !== 2) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'black', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Loading or invalid IDs...</h2>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-row items-center justify-center gap-6 relative">
        <img
          src={players[0].image_url}
          alt={players[0].name}
          className="w-40 h-40 object-cover rounded-xl border"
        />
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-goat text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-full shadow-lg z-10">
          VS
        </div>
        <img
          src={players[1].image_url}
          alt={players[1].name}
          className="w-40 h-40 object-cover rounded-xl border"
        />
      </div>
    </main>
  )
}
