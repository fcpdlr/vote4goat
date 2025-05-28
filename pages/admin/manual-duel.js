import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ManualDuel() {
  const router = useRouter()
  const { id1, id2 } = router.query
  const [players, setPlayers] = useState([])

  useEffect(() => {
    if (id1 && id2) {
      supabase
        .from('players')
        .select('id, name, image_url')
        .in('id', [id1, id2])
        .then(({ data }) => {
          if (data && data.length === 2) {
            setPlayers(data)
          }
        })
    }
  }, [id1, id2])

  if (players.length !== 2) {
    return <p className="text-white text-center mt-20">Loading...</p>
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
      <div className="flex flex-row items-center gap-6 relative">
        <img src={players[0].image_url} alt="" className="w-40 h-40 object-cover rounded-xl" />
        <div className="text-white text-xl font-bold z-10">VS</div>
        <img src={players[1].image_url} alt="" className="w-40 h-40 object-cover rounded-xl" />
      </div>
    </main>
  )
}
