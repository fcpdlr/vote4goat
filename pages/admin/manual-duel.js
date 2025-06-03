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
      fetchPlayers(id1, id2)
    }
  }, [])

  const fetchPlayers = async (id1, id2) => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, image_url')
      .in('id', [id1, id2])

    if (error) {
      console.error('Error fetching players:', error)
    } else {
      const ordered = [
        data.find(p => p.id === id1),
        data.find(p => p.id === id2)
      ]
      setPlayers(ordered)
    }
  }

  if (players.length === 0) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'black', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Loading or invalid IDs...</h2>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-row items-center justify-center gap-6 relative">
        {players.map((player, index) => (
          <img
            key={index}
            src={player.image_url}
            alt={player.name}
            className="w-40 h-40 object-cover rounded-xl border"
          />
        ))}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-goat text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-full shadow-lg z-10">
          VS
        </div>
      </div>
    </main>
  )
}
