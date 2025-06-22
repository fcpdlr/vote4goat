// pages/account.js
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [votes, setVotes] = useState([])

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  const fetchUserAndProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, birthdate, country, votes_visible')
      .eq('id', user.id)
      .single()

    setProfile(profileData)

   const { data: voteData, error: voteError } = await supabase
  .rpc('get_vote_history_by_user', { user_id_input: user.id })

if (voteError) {
  console.error('Error fetching vote history:', voteError)
}
setVotes(voteData || [])

  }

  const toggleVisibility = async () => {
    const newValue = !profile.votes_visible
    setProfile({ ...profile, votes_visible: newValue })

    await supabase
      .from('profiles')
      .update({ votes_visible: newValue })
      .eq('id', user.id)
  }

  if (!user || !profile) return <main className="p-6 text-white">Loading...</main>

  const calculateAge = (birthdate) => {
    const birth = new Date(birthdate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-4 text-white font-sans">
      <h1 className="text-3xl font-extrabold mb-6 text-goat text-center">MY ACCOUNT</h1>

      <div className="max-w-xl mx-auto bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
        <div>
          <p className="text-sm text-white/70">Email</p>
          <p className="font-semibold">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-white/70">Username</p>
          <p className="font-semibold">{profile.username}</p>
        </div>
        <div>
          <p className="text-sm text-white/70">Country</p>
          <p className="font-semibold">{profile.country}</p>
        </div>
        <div>
          <p className="text-sm text-white/70">Age</p>
          <p className="font-semibold">{calculateAge(profile.birthdate)}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-white/70">Make vote history public</p>
          <input
            type="checkbox"
            checked={profile.votes_visible}
            onChange={toggleVisibility}
            className="form-checkbox h-5 w-5 text-goat"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-10">
        <h2 className="text-xl font-bold mb-4 text-goat text-center">MY VOTE HISTORY</h2>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/20">
              <th className="py-2 px-2 text-white/70">Date</th>
              <th className="py-2 px-2 text-white/70">Winner</th>
              <th className="py-2 px-2 text-white/70">Loser</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((vote, index) => (
              <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                <td className="py-2 px-2">{new Date(vote.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-2 font-semibold text-goat">{vote.winner_name}</td>
                <td className="py-2 px-2 text-white/80">{vote.loser_name}</td>

              </tr>
            ))}
            {votes.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-white/50">No votes yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
