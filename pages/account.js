import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { COUNTRIES } from "../lib/countries"
import Head from "next/head"
import Header from "../components/Header"
import Footer from "../components/Footer"

const EMOJIS = [
  "⚽", "🏀", "🎾", "🏆", "👑", "🔥", "⚡", "💎",
  "🎯", "🧠", "🦁", "🐐", "🦅", "🌍", "💪", "🎲",
  "🏅", "⭐", "🚀", "🎪", "🦊", "🐺", "🎭", "🌟"
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1920 - 12 }, (_, i) => CURRENT_YEAR - 13 - i)

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const m = Math.floor(diff / 60000)
  if (m < 2) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  const w = Math.floor(d / 7)
  if (w < 5) return `${w}w ago`
  return new Date(dateStr).toLocaleDateString("en", { month: "short", year: "numeric" })
}

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const [username, setUsername] = useState("")
  const [country, setCountry] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [avatarEmoji, setAvatarEmoji] = useState("⚽")
  const [isPublic, setIsPublic] = useState(false)
  const [votesVisible, setVotesVisible] = useState(true)
  const [usernameError, setUsernameError] = useState("")

  const [stats, setStats] = useState({ dvels: 0, tops: 0, rank4: 0 })
  const [history, setHistory] = useState({ dvels: [], tops: [], rank4: [] })
  const [historyTab, setHistoryTab] = useState("dvels")

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = "/login"; return }
      setUser(user)

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (prof) {
        setProfile(prof)
        setUsername(prof.username || "")
        setCountry(prof.country || "")
        setBirthYear(prof.birth_year ? String(prof.birth_year) : "")
        setAvatarEmoji(prof.avatar_emoji || "⚽")
        setIsPublic(prof.is_public || false)
        setVotesVisible(prof.votes_visible !== false)
      }

      const { count: dvelsCount } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      const { count: topsCount } = await supabase
        .from("top10_votes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      const { count: rank4Count } = await supabase
        .from("rank4_votes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      setStats({
        dvels: dvelsCount || 0,
        tops: topsCount || 0,
        rank4: rank4Count || 0
      })

      // DVELS history
      let dvelsHistory = []
      const { data: dvelsRaw } = await supabase
        .from("votes")
        .select("id, created_at, winner_id, loser_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
      if (dvelsRaw?.length > 0) {
        const allIds = [...new Set(dvelsRaw.flatMap(v => [v.winner_id, v.loser_id]))]
        const { data: rankings } = await supabase
          .from("entity_rankings")
          .select("id, entities(name, name_line2, image_url)")
          .in("id", allIds)
        const rankMap = Object.fromEntries((rankings || []).map(r => [r.id, r.entities]))
        dvelsHistory = dvelsRaw.map(v => ({
          id: v.id,
          created_at: v.created_at,
          winner: rankMap[v.winner_id],
          loser: rankMap[v.loser_id],
        }))
      }

      // T0PS history
      let topsHistory = []
      const { data: topsRaw } = await supabase
        .from("top10_votes")
        .select("id, created_at, top10_category_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
      if (topsRaw?.length > 0) {
        const catIds = [...new Set(topsRaw.map(v => v.top10_category_id).filter(Boolean))]
        if (catIds.length > 0) {
          const { data: cats } = await supabase
            .from("top10_categories")
            .select("id, title")
            .in("id", catIds)
          const catMap = Object.fromEntries((cats || []).map(c => [c.id, c.title]))
          topsHistory = topsRaw.map(v => ({
            id: v.id,
            created_at: v.created_at,
            title: catMap[v.top10_category_id] || "Top 10",
          }))
        } else {
          topsHistory = topsRaw.map(v => ({ id: v.id, created_at: v.created_at, title: "Top 10" }))
        }
      }

      // R4NK history
      let rank4History = []
      const { data: rankRaw } = await supabase
        .from("rank4_votes")
        .select("id, created_at, question_id, position_1, position_2, position_3, position_4")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
      if (rankRaw?.length > 0) {
        const qIds = [...new Set(rankRaw.map(v => v.question_id).filter(Boolean))]
        if (qIds.length > 0) {
          const { data: qs } = await supabase
            .from("rank4_questions")
            .select("id, title")
            .in("id", qIds)
          const qMap = Object.fromEntries((qs || []).map(q => [q.id, q.title]))
          rank4History = rankRaw.map(v => ({
            id: v.id,
            created_at: v.created_at,
            title: qMap[v.question_id] || "R4NK",
            positions: [v.position_1, v.position_2, v.position_3, v.position_4].filter(Boolean),
          }))
        } else {
          rank4History = rankRaw.map(v => ({
            id: v.id,
            created_at: v.created_at,
            title: "R4NK",
            positions: [v.position_1, v.position_2, v.position_3, v.position_4].filter(Boolean),
          }))
        }
      }

      setHistory({ dvels: dvelsHistory, tops: topsHistory, rank4: rank4History })

      setLoading(false)
    }
    init()
  }, [])

  const validateUsername = (u) => /^[a-zA-Z0-9_]{3,20}$/.test(u)

  const handleSave = async () => {
    setUsernameError("")
    if (!validateUsername(username)) {
      setUsernameError("3-20 characters. Letters, numbers and underscores only.")
      return
    }

    setSaving(true)

    if (username !== profile?.username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .neq("id", user.id)
        .single()

      if (existing) {
        setUsernameError("This username is already taken.")
        setSaving(false)
        return
      }
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username: username.toLowerCase(),
        country: country || null,
        birth_year: birthYear ? parseInt(birthYear) : null,
        avatar_emoji: avatarEmoji,
        is_public: isPublic,
        votes_visible: votesVisible,
      })

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : null

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-goat border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <>
      <Head>
        <title>My Profile | Vote4GOAT</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background text-white font-sans">
        <Header />

        <main className="pb-16">

          {/* HERO */}
          <div className="flex flex-col items-center px-4 pt-6 pb-4">

            <div className="relative mb-4">
              <div
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-20 h-20 rounded-2xl bg-white/5 border border-goat/30 flex items-center justify-center text-4xl cursor-pointer hover:border-goat/60 transition"
              >
                {avatarEmoji}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-goat rounded-lg flex items-center justify-center text-xs text-black font-bold cursor-pointer"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                ✏
              </div>
            </div>

            {showEmojiPicker && (
              <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Pick your avatar</p>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => { setAvatarEmoji(e); setShowEmojiPicker(false) }}
                      className={"text-2xl p-1 rounded-lg transition " + (avatarEmoji === e ? "bg-goat/20 border border-goat/40" : "hover:bg-white/10")}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xl font-bold text-white mb-1">@{username || "..."}</div>
            <div className="flex items-center gap-2 text-xs text-white/30 flex-wrap justify-center">
              {country && <span>{country}</span>}
              {country && birthYear && <span>·</span>}
              {birthYear && <span>Born {birthYear}</span>}
              {memberSince && <span>· Since {memberSince}</span>}
            </div>
          </div>

          {/* STATS */}
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

          {/* EDIT PROFILE */}
          <div className="mx-4 mb-4">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Profile</p>

            <div className="flex flex-col gap-3">

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    maxLength={20}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-goat/50 transition"
                  />
                </div>
                {usernameError && <p className="text-xs text-red-400 mt-1">{usernameError}</p>}
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">Country <span className="normal-case text-white/20">(optional)</span></label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-goat/50 transition"
                >
                  <option value="" style={{ background: "#111827" }}>Select country</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c} style={{ background: "#111827" }}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">Year of birth <span className="normal-case text-white/20">(optional)</span></label>
                <select
                  value={birthYear}
                  onChange={e => setBirthYear(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-goat/50 transition"
                >
                  <option value="" style={{ background: "#111827" }}>Select year</option>
                  {YEARS.map(y => (
                    <option key={y} value={y} style={{ background: "#111827" }}>{y}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* PRIVACY */}
          <div className="mx-4 mb-6">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Privacy</p>

            <div className="flex flex-col gap-2">

              <div
                onClick={() => setIsPublic(!isPublic)}
                className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-white">Public profile</p>
                  {isPublic ? (
                    <p className="text-xs text-goat mt-0.5">vote4goat.com/u/{username}</p>
                  ) : (
                    <p className="text-xs text-white/30 mt-0.5">Only you can see your profile</p>
                  )}
                </div>
                <div className={"w-10 h-6 rounded-full relative transition-colors " + (isPublic ? "bg-goat" : "bg-white/20")}>
                  <div className={"absolute top-1 w-4 h-4 bg-white rounded-full transition-all " + (isPublic ? "right-1" : "left-1")} />
                </div>
              </div>

              <div
                onClick={() => setVotesVisible(!votesVisible)}
                className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-white">Show vote history</p>
                  <p className="text-xs text-white/30 mt-0.5">Let others see what you voted</p>
                </div>
                <div className={"w-10 h-6 rounded-full relative transition-colors " + (votesVisible ? "bg-goat" : "bg-white/20")}>
                  <div className={"absolute top-1 w-4 h-4 bg-white rounded-full transition-all " + (votesVisible ? "right-1" : "left-1")} />
                </div>
              </div>

            </div>
          </div>

          {/* HISTORY */}
          <div className="mx-4 mb-6">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Recent activity</p>

            <div className="flex gap-2 mb-3">
              {[
                { id: "dvels", label: "DVELS" },
                { id: "tops", label: "T0PS" },
                { id: "rank4", label: "R4NK" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setHistoryTab(tab.id)}
                  className={"px-3 py-1.5 rounded-full text-xs font-bold transition " + (historyTab === tab.id ? "bg-goat text-black" : "bg-white/5 text-white/40 hover:text-white/70")}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {historyTab === "dvels" && (
              <div className="flex flex-col gap-2">
                {history.dvels.length === 0 ? (
                  <p className="text-sm text-white/25 text-center py-4">No DVELS votes yet.</p>
                ) : history.dvels.map(v => (
                  <div key={v.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5">
                    {v.winner?.image_url && (
                      <img src={v.winner.image_url} className="w-7 h-7 rounded-full object-cover object-top border border-goat/30 flex-shrink-0" alt="" loading="lazy" />
                    )}
                    <p className="text-sm text-white flex-1 truncate">
                      <span className="font-semibold">{v.winner?.name_line2 || v.winner?.name || "?"}</span>
                      <span className="text-white/30"> over </span>
                      <span className="text-white/60">{v.loser?.name_line2 || v.loser?.name || "?"}</span>
                    </p>
                    <span className="text-[10px] text-white/25 flex-shrink-0">{timeAgo(v.created_at)}</span>
                  </div>
                ))}
              </div>
            )}

            {historyTab === "tops" && (
              <div className="flex flex-col gap-2">
                {history.tops.length === 0 ? (
                  <p className="text-sm text-white/25 text-center py-4">No T0PS votes yet.</p>
                ) : history.tops.map(v => (
                  <div key={v.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5">
                    <div className="w-7 h-7 rounded-full bg-goat/10 border border-goat/20 flex items-center justify-center text-sm flex-shrink-0">🏆</div>
                    <p className="text-sm text-white flex-1 truncate font-medium">{v.title}</p>
                    <span className="text-[10px] text-white/25 flex-shrink-0">{timeAgo(v.created_at)}</span>
                  </div>
                ))}
              </div>
            )}

            {historyTab === "rank4" && (
              <div className="flex flex-col gap-2">
                {history.rank4.length === 0 ? (
                  <p className="text-sm text-white/25 text-center py-4">No R4NK votes yet.</p>
                ) : history.rank4.map(v => (
                  <div key={v.id} className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm text-white font-medium truncate flex-1">{v.title}</p>
                      <span className="text-[10px] text-white/25 flex-shrink-0 ml-2">{timeAgo(v.created_at)}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {v.positions.map((p, i) => (
                        <span key={i} className="text-[10px] bg-white/5 text-white/50 px-1.5 py-0.5 rounded-md">{i + 1}. {p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAVE */}
          <div className="mx-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={"w-full py-3 rounded-xl text-sm font-bold transition " + (saved ? "bg-green-500 text-white" : saving ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-goat text-black hover:brightness-110")}
            >
              {saved ? "Saved!" : saving ? "Saving..." : "Save changes"}
            </button>
          </div>

        </main>

        <Footer />
      </div>
    </>
  )
}
