'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ManualDuel() {
  const searchParams = useSearchParams()
  const id1 = searchParams.get('id1')
  const id2 = searchParams.get('id2')

  const [players, setPlayers] = useState([])

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!id1 || !id2) return
      const { data } = await supabase
        .from('players')
        .select('id, name, image_url')
        .in('id', [id1, id2])
      setPlayers(data || [])
    }

    fetchPlayers()
  }, [id1, id2])

  if (players.length !== 2) return <p className="text-white text-center mt-10">Loading duel...</p>

  const [player1, player2] = players

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-center text-white font-sans">
      <section className="flex flex-col items-center justify-center px-4 py-12 relative">
        <div className="flex flex-row items-center justify-center gap-6">
          <PlayerCard player={player1} />
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-goat text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-full shadow-lg z-10">VS</div>
          <PlayerCard player={player2} />
        </div>
      </section>
    </main>
  )
}

function PlayerCard({ player }) {
  const [firstName, ...lastNameParts] = player.name.split(" ")
  const lastName = lastNameParts.join(" ")

  return (
    <div className="cursor-default transition hover:scale-105 focus:outline-none">
      {player.image_url ? (
        <img
          src={player.image_url}
          alt={player.name}
          className="w-40 h-40 object-cover rounded-xl border mx-auto transition duration-200 ease-in-out hover:ring-4 hover:ring-goat hover:brightness-110"
        />
      ) : (
        <div className="w-40 h-40 bg-gray-200 rounded-xl border flex items-center justify-center text-gray-500 text-xs mx-auto">
          No image
        </div>
      )}
      <div className="mt-2 text-xs font-medium tracking-wide text-white">
        {lastName ? firstName.toUpperCase() : ""}
      </div>
      <div className="text-xl font-extrabold text-goat">
        {(lastName || firstName).toUpperCase()}
      </div>
    </div>
  )
}
