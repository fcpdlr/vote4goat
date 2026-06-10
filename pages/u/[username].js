import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { supabase } from "../../lib/supabase"
import Head from "next/head"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

export default function PublicProfile() {
  const router = useRouter()
  const { username } = router.query
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return
    const load = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.toLowerCase())
        .single()

      if (!prof) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setProfile(prof)

      if (prof.is_public) {
        const [{ count: dvels }, { count: tops }, { count: rank4 }] = await Promise.all([
          supabase.from("votes").select("*", { count: "exact", head: true }).eq("user_id", prof.id),
          supabase.from("top10_votes").select("*", { count: "exact", head: true }).eq("user_id", prof.id),
          supabase.from("rank4_votes").select("*", { count: "exact", head: true }).eq("user_id", prof.id),
        ])
        setStats({ dvels: dvels || 0, tops: tops || 0, rank4: rank4 || 0 })
      }

      setLoading(false)
    }
    load()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-goat border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <>
        <Head>
          <title>Profile not found | Vote4GOAT</title>
          <meta name="robots" content="noindex" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-background text-white font-sans">
          <Header />
          <main className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="text-5xl mb-4">🐐</div>
            <h1 className="text-xl font-bold text-white mb-2">Profile not found</h1>
            <p className="text-sm text-white/40 mb-6">This username doesn't exist on Vote4GOAT.</p>
            <a href="/" className="text-sm text-goat hover:underline">Go home</a>
          </main>
          <Footer />
        </div>
      </>
    )
  }

  const memberSince = profile.created_at ? new Date(profile.created_at).getFullYear() : null

  if (!profile.is_public) {
    return (
      <>
        <Head>
          <title>@{profile.username} | Vote4GOAT</title>
          <meta name="robots" content="noindex" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-background text-white font-sans">
          <Header />
          <main className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="text-5xl mb-4">{profile.avatar_emoji || "⚽"}</div>
            <h1 className="text-xl font-bold text-white mb-2">@{profile.username}</h1>
            <p className="text-sm text-white/40">This profile is private.</p>
          </main>
          <Footer />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>@{profile.username} | Vote4GOAT</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-background text-white font-sans">
        <Header />

        <main className="pb-16">

          <div className="flex flex-col items-center px-4 pt-8 pb-4">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-goat/30 flex items-center justify-center text-4xl mb-4">
              {profile.avatar_emoji || "⚽"}
            </div>
            <div className="text-xl font-bold text-white mb-1">@{profile.username}</div>
            <div className="flex items-center gap-2 text-xs text-white/30 flex-wrap justify-center">
              {profile.country && <span>{profile.country}</span>}
              {profile.country && profile.birth_year && <span>·</span>}
              {profile.birth_year && <span>Born {profile.birth_year}</span>}
              {memberSince && <span>· Since {memberSince}</span>}
            </div>
          </div>

          {stats && (
            <div className="mx-4 mb-6 grid grid-cols-3 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03]">
              <div className="flex flex-col items-center py-4 gap-1">
                <span className="text-2xl font-black text-goat" style={{ fontFamily: "system-ui" }}>{stats.dvels.toLocaleString()}</span>
                <span className="text-xs text-white/30 uppercase tracking-wide">DVELS</span>
              </div>
              <div className="flex flex-col items-center py-4 gap-1 border-x border-white/10">
                <span className="text-2xl font-black text-goat" style={{ fontFamily: "system-ui" }}>{stats.tops}</span>
                <span className="text-xs text-white/30 uppercase tracking-wide">T0PS</span>
              </div>
              <div className="flex flex-col items-center py-4 gap-1">
                <span className="text-2xl font-black text-goat" style={{ fontFamily: "system-ui" }}>{stats.rank4}</span>
                <span className="text-xs text-white/30 uppercase tracking-wide">R4NK</span>
              </div>
            </div>
          )}

        </main>

        <Footer />
      </div>
    </>
  )
}
