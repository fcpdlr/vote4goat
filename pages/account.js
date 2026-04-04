import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Head from "next/head"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const EMOJIS = [
"\u26BD", "\uD83C\uDFC0", "\uD83C\uDFBE", "\uD83C\uDFC6", "\uD83D\uDC51", "\uD83D\uDD25", "\u26A1", "\uD83D\uDC8E",
"\uD83C\uDFAF", "\uD83E\uDDE0", "\uD83E\uDD81", "\uD83D\uDC10", "\uD83E\uDD85", "\uD83C\uDF0D", "\uD83D\uDCAA", "\uD83C\uDFB2",
"\uD83C\uDFC5", "\u2B50", "\uD83D\uDE80", "\uD83C\uDFAA", "\uD83E\uDD8A", "\uD83D\uDC3A", "\uD83C\uDFAD", "\uD83C\uDF1F"
]

const COUNTRIES = [
"Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Belgium","Bolivia",
"Brazil","Bulgaria","Canada","Chile","China","Colombia","Croatia","Czech Republic",
"Denmark","Ecuador","Egypt","England","Finland","France","Germany","Ghana","Greece",
"Hungary","India","Indonesia","Iran","Ireland","Israel","Italy","Japan","Jordan",
"Kazakhstan","Kenya","Mexico","Morocco","Netherlands","New Zealand","Nigeria",
"Norway","Pakistan","Paraguay","Peru","Philippines","Poland","Portugal","Romania",
"Russia","Saudi Arabia","Scotland","Senegal","Serbia","South Africa","South Korea",
"Spain","Sweden","Switzerland","Turkey","Ukraine","United Arab Emirates",
"United Kingdom","United States","Uruguay","Venezuela","Wales"
]

export default function AccountPage() {
const [user, setUser] = useState(null)
const [profile, setProfile] = useState(null)
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [saved, setSaved] = useState(false)
const [showEmojiPicker, setShowEmojiPicker] = useState(false)
const [showMenu, setShowMenu] = useState(false)

const [username, setUsername] = useState("")
const [country, setCountry] = useState("")
const [birthdate, setBirthdate] = useState("")
const [avatarEmoji, setAvatarEmoji] = useState("\u26BD")
const [isPublic, setIsPublic] = useState(false)
const [votesVisible, setVotesVisible] = useState(true)
const [usernameError, setUsernameError] = useState("")

const [stats, setStats] = useState({ dvels: 0, tops: 0, rank4: 0 })

useEffect(() => {
const init = async () => {
const { data: { user } } = await supabase.auth.getUser()
if (!user) { window.location.href = "/login"; return }
setUser(user)

```
  const { data: prof } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (prof) {
    setProfile(prof)
    setUsername(prof.username || "")
    setCountry(prof.country || "")
    setBirthdate(prof.birthdate || "")
    setAvatarEmoji(prof.avatar_emoji || "\u26BD")
    setIsPublic(prof.is_public || false)
    setVotesVisible(prof.votes_visible !== false)
  }

  // Fetch vote counts
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

  setLoading(false)
}
init()
```

}, [])

const validateUsername = (u) => /^[a-zA-Z0-9_]{3,20}$/.test(u)

const handleSave = async () => {
setUsernameError("")
if (!validateUsername(username)) {
setUsernameError("3-20 characters. Letters, numbers and underscores only.")
return
}

```
setSaving(true)

// Check username uniqueness (only if changed)
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
    birthdate: birthdate || null,
    avatar_emoji: avatarEmoji,
    is_public: isPublic,
    votes_visible: votesVisible,
  })

setSaving(false)
if (!error) {
  setSaved(true)
  setTimeout(() => setSaved(false), 2000)
}
```

}

const handleLogout = async () => {
await supabase.auth.signOut()
window.location.href = "/"
}

const birthYear = birthdate ? new Date(birthdate).getFullYear() : null
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

```
  <main className="min-h-screen bg-background text-white font-sans pb-16">

    {/* HEADER */}
    <header className="flex items-center justify-between px-4 py-3">
      <a href="/" className="text-xl font-bold text-white">
        Vote4<span className="text-goat">GOAT</span>
      </a>
      <button
        onClick={handleLogout}
        className="text-xs text-white/30 hover:text-white/60 transition"
      >
        Log out
      </button>
    </header>

    {/* HERO */}
    <div className="flex flex-col items-center px-4 pt-6 pb-4">

      {/* Avatar */}
      <div className="relative mb-4">
        <div
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="w-20 h-20 rounded-2xl bg-white/5 border border-goat/30 flex items-center justify-center text-4xl cursor-pointer hover:border-goat/60 transition"
        >
          {avatarEmoji}
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-goat rounded-lg flex items-center justify-center text-xs text-black font-bold cursor-pointer"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          \u270F
        </div>
      </div>

      {/* Emoji picker */}
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
        {country && birthYear && <span>\u00B7</span>}
        {birthYear && <span>Born {birthYear}</span>}
        {memberSince && <span>\u00B7 Since {memberSince}</span>}
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

        {/* Username */}
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

        {/* Country */}
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

        {/* Birthdate */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">Date of birth <span className="normal-case text-white/20">(optional)</span></label>
          <input
            type="date"
            value={birthdate ? birthdate.split("T")[0] : ""}
            onChange={e => setBirthdate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-goat/50 transition"
          />
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
            {isPublic && (
              <p className="text-xs text-goat mt-0.5">vote4goat.com/u/{username}</p>
            )}
            {!isPublic && (
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
</>
```

)
}
