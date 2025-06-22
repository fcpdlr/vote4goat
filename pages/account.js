// pages/account.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Account() {
  const [user, setUser] = useState(null)
  const [votes, setVotes] = useState([])
  const [isPublic, setIsPublic] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
        fetchVotes(data.user.id)
        fetchVisibility(data.user.id)
      }
    }
    getUser()
  }, [])

  const fetchVotes = async (userId) => {
    const { data, error } = await supabase
      .from('votes_new')
      .select(`
        winner:entity_rankings!winner_ranking_id ( entities(name) ),
        loser:entity_rankings!loser_ranking_id ( entities(name) )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error) {
      setVotes(data)
    }
  }

  const fetchVisibility = async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('votes_visible')
      .eq('id', userId)
      .single()

    if (!error && data) setIsPublic(data.votes_visible)
  }

  const toggleVisibility = async () => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ votes_visible: !isPublic })
      .eq('id', user.id)

    if (!error) setIsPublic(!isPublic)
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-background text-white p-6">
      <h1 className="text-2xl font-bold text-goat mb-4">My Profile</h1>

      <div className="bg-white/10 p-4 rounded-xl mb-6">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Country:</strong> {user.user_metadata?.country || 'N/A'}</p>
        <p><strong>Birthdate:</strong> {user.user_metadata?.dob || 'N/A'}</p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Vote History</h2>
        <button
          onClick={toggleVisibility}
          className="text-sm px-3 py-1 rounded-full bg-goat text-black font-semibold"
        >
          {isPublic ? 'Make Private' : 'Make Public'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="text-goat border-b border-white/20">
              <th className="text-left py-2 px-3">Winner</th>
              <th className="text-left py-2 px-3">Loser</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((vote, index) => (
              <tr key={index} className="border-b border-white/10">
                <td className="py-2 px-3">{vote.winner.entities.name}</td>
                <td className="py-2 px-3">{vote.loser.entities.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
