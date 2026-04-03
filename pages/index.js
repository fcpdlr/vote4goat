import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import Head from "next/head"
import { Swords } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TopsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 88 88" fill="none">
    <rect x="10" y="8" width="68" height="11" rx="2.5" stroke={active ? "#f5a623" : "rgba(255,255,255,0.4)"} strokeWidth="2.5"/>
    <rect x="10" y="23" width="68" height="11" rx="2.5" stroke={active ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="2"/>
    <rect x="10" y="38" width="68" height="11" rx="2.5" stroke={active ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="2" opacity="0.7"/>
    <rect x="10" y="53" width="68" height="11" rx="2.5" stroke={active ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="2" opacity="0.45"/>
    <rect x="10" y="68" width="68" height="11" rx="2.5" stroke={active ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="2" opacity="0.25"/>
    <circle cx="28" cy="84" r="2" fill="white" opacity="0.2"/>
    <circle cx="44" cy="84" r="2" fill="white" opacity="0.2"/>
    <circle cx="60" cy="84" r="2" fill="white" opacity="0.2"/>
  </svg>
)

const RankIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 88 88" fill="none">
    <rect x="30" y="8" width="28" height="13" rx="2.5" stroke={active ? "#f5a623" : "rgba(255,255,255,0.4)"} strokeWidth="2.5"/>
    <rect x="20" y="26" width="48" height="13" rx="2.5" stroke={active ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="2"/>
    <rect x="10" y="44" width="68" height="13" rx="2.5" stroke={active ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="2"/>
    <rect x="4" y="62" width="80" height="13" rx="2.5" stroke={active ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="2"/>
    <circle cx="44" cy="14.5" r="2.5" fill={active ? "#f5a623" : "rgba(255,255,255,0.4)"}/>
  </svg>
)

export default function Home() {
  const [user, setUser] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [activeMode, setActiveMode] = useState("dvels")
  const [activeSport, setActiveSport] = useState("all")
  const [ranking, setRanking] = useState([])
  const [activeRank4, setActiveRank4] = useState(null)
  const [topElo, setTopElo] = useState(1)

  const menuRef = useRef()
  const helpRef = useRef()

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false)
      if (helpRef.current && !helpRef.current.contains(event.target)) setShowHelp(false)
    }
    function handleEsc(event) {
      if (event.key === "Escape") { setShowMenu(false); setShowHelp(false) }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {}
    }
    checkUser()
  }, [])

  useEffect(() => {
    const fetchRanking = async () => {
      const categoryId = activeSport === "basketball" ? 2 : 1
      const { data } = await supabase
        .from("entity_rankings")
        .select("id, elo_rating, entities (name, image_url)")
        .eq("entity_category_id", categoryId)
        .order("elo_rating", { ascending: false })
        .limit(5)
      const results = data || []
      setRanking(results)
      if (results.length > 0) setTopElo(results[0].elo_rating)
    }
    if (activeMode === "dvels") fetchRanking()
  }, [activeMode, activeSport])

  useEffect(() => {
    const fetchActiveRank4 = async () => {
      const { data } = await supabase
        .from("rank4_questions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
      if (data) setActiveRank4(data)
    }
    fetchActiveRank4()
  }, [])

  const modesConfig = [
    { id: "dvels", sports: ["football", "basketball", "tennis"] },
    { id: "tops", sports: ["football"] },
    { id: "rank", sports: ["football"] },
  ]

  const isModeAvailable = (modeId) => {
    if (activeSport === "all") return true
    const mode = modesConfig.find(m => m.id === modeId)
    return mode?.sports.includes(activeSport)
  }

  const getDvelsHref = () => activeSport === "basketball" ? "/basketball" : "/football"

  const medal = (i) => i === 0 ? String.fromCodePoint(0x1F947) : i === 1 ? String.fromCodePoint(0x1F948) : i === 2 ? String.fromCodePoint(0x1F949) : null

  const modes = [
    {
      id: "dvels",
      label: ["D", "V", "E", "L", "S"],
      accent: [1, 4],
      descShort: "1v1 duels. You choose.",
      descLong: "Two players appear. You pick the one you think is the greatest. Every vote moves the ranking. The more votes, the more accurate it gets.",
      tags: [
        { label: "⚽ Football", active: true },
        { label: "🏀 Basketball", active: true },
        { label: "🎾 Tennis – soon", active: false },
      ],
      cta: "Start voting",
      icon: (active) => <Swords size={22} strokeWidth={1.5} className={active ? "text-goat" : "text-white/40"} />,
    },
    {
      id: "tops",
      label: ["T", "1", "0", "P", "S"],
      accent: [1, 2],
      descShort: "Build your Top 10.",
      descLong: "Pick a club or national team and drag your 10 players into order from best to worst. Then see how your list compares with the world.",
      tags: [
        { label: "⚽ Football", active: true },
        { label: "🏀 Basketball – soon", active: false },
      ],
      cta: "Build your Top 10",
      href: "/top10",
      icon: (active) => <TopsIcon active={active} />,
    },
    {
      id: "rank",
      label: ["R", "4", "N", "K"],
      accent: [1],
      descShort: "Rank 4. Weekly.",
      descLong: "Every week a new question drops with 4 players. Order them from best to worst. When the week ends, the world verdict is revealed.",
      tags: [
        { label: "⚽ Football", active: true },
        { label: "🏀 Basketball – soon", active: false },
      ],
      cta: "See this week",
      href: "/rank4",
      icon: (active) => <RankIcon active={active} />,
    },
  ]

  const activeM = modes.find(m => m.id === activeMode)

  return (
    <>
      <Head>
        <title>Vote4GOAT – The world decides who is the GOAT</title>
        <meta name="description" content="Vote in 1v1 duels, build your Top 10 and rank the greatest athletes of all time. The only ranking built by the world." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://vote4goat.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Vote4GOAT -- The world decides who is the GOAT" />
        <meta property="og:description" content="Vote in 1v1 duels, build your Top 10 and rank the greatest athletes of all time. The only ranking built by the world." />
        <meta property="og:url" content="https://vote4goat.com" />
        <meta property="og:image" content="https://vote4goat.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Vote4GOAT" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vote4GOAT -- The world decides who is the GOAT" />
        <meta name="twitter:description" content="Vote in 1v1 duels, build your Top 10 and rank the greatest athletes of all time. The only ranking built by the world." />
        <meta name="twitter:image" content="https://vote4goat.com/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">

        <header className="flex items-center justify-between px-3 py-2">
          <span className="text-xl sm:text-2xl font-bold text-white">Vote4GOAT</span>
          <nav className="flex items-center gap-3 text-xs sm:text-sm">
            <button onClick={() => setShowHelp(!showHelp)} className="hover:underline">About</button>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="text-goat font-semibold hover:underline">My Account</button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-28 bg-white text-black rounded shadow-md z-50">
                    <a href="/account" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</a>
                    <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/login" className="hover:underline">Log In</a>
                <a href="/signup" className="bg-goat text-black px-2 py-1 rounded-full font-semibold hover:brightness-105">Sign Up</a>
              </>
            )}
          </nav>
        </header>

        {showHelp && (
          <div ref={helpRef} className="max-w-xl mx-auto text-sm bg-white/5 text-white p-4 rounded-xl mt-2 border border-white/10">
            <p className="mb-2 font-semibold text-goat">What is Vote4GOAT?</p>
            <p className="mb-2">Everyone has an opinion on who is the greatest of all time. Vote4GOAT lets the world decide through duels, Top 10 lists, and weekly rankings.</p>
            <p className="mt-4 font-semibold text-goat">Start voting. Shape the GOAT list.</p>
          </div>
        )}

        <div className="text-center pt-10 pb-6 px-4">
          <p className="text-xs tracking-widest uppercase text-white/30 mb-3">The world decides</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
            Who is the <span className="text-goat">GOAT?</span>
          </h1>
          <p className="text-sm text-white/40 max-w-sm mx-auto">Vote, rank and debate. The only place where the world settles the argument.</p>
        </div>

        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {[
            { id: "all", label: "All sports" },
            { id: "football", label: "&#9917; Football" },
            { id: "basketball", label: "🏀 Basketball" },
            { id: "tennis", label: "🎾 Tennis" },
          ].map(sport => (
            <button
              key={sport.id}
              onClick={() => { setActiveSport(sport.id); setActiveMode("dvels") }}
              className={"px-3 py-1.5 rounded-full text-sm border transition " + (activeSport === sport.id ? "border-goat text-goat bg-goat/5" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70")}
            >
              {sport.label}
            </button>
          ))}
        </div>

        <div className="max-w-lg mx-auto w-full px-1 mb-4">
          <div className="flex gap-2">
            {modes.map((mode) => {
              const available = isModeAvailable(mode.id)
              const active = activeMode === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => available && setActiveMode(mode.id)}
                  className={"flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition relative " + (active ? "bg-white/5 border-goat/30" : "bg-background border-white/10 hover:bg-white/[0.03]") + (!available ? " opacity-20 cursor-not-allowed" : " cursor-pointer")}
                >
                  <div className={"w-11 h-11 rounded-xl flex items-center justify-center border transition " + (active ? "bg-goat/10 border-goat/30" : "bg-white/[0.04] border-white/10")}>
                    {mode.icon(active)}
                  </div>
                  <div className="text-lg font-black tracking-wider leading-none" style={{ fontFamily: "system-ui, sans-serif" }}>
                    {mode.label.map((letter, i) => (
                      <span key={i} className={mode.accent.includes(i) ? "text-goat" : (active ? "text-white" : "text-white/50")}>
                        {letter}
                      </span>
                    ))}
                  </div>
                  <div className={"text-xs text-center leading-tight transition " + (active ? "text-white/50" : "text-white/25")}>
                    {mode.descShort}
                  </div>
                  {active && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-goat rounded-full" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="max-w-lg mx-auto w-full px-1 flex-1">

          {activeM && (
            <div className="bg-white/5 border border-goat/20 rounded-2xl p-5 mb-4">
              <p className="text-sm font-semibold text-white mb-2">{activeM.descLong}</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {activeM.tags.map((tag, i) => (
                  <span key={i} className={"text-xs px-2 py-1 rounded-full " + (tag.active ? "bg-goat/10 text-goat" : "bg-white/5 text-white/30")}>
                    {tag.label}
                  </span>
                ))}
              </div>
              <a
                href={activeM.id === "dvels" ? getDvelsHref() : activeM.href}
                className="block w-full py-2.5 rounded-xl text-sm font-bold text-center bg-goat text-black hover:brightness-110 transition"
              >
                {activeM.cta} ->
              </a>
            </div>
          )}

          {activeMode === "dvels" && ranking.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                  Current ranking -- {activeSport === "basketball" ? "Basketball" : "Football"}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-white/30">live</span>
                </div>
              </div>
              {ranking.map((player, i) => {
                const barPct = Math.round((player.elo_rating / topElo) * 100)
                const barColor = i === 0 ? "bg-goat" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-white/20"
                return (
                  <div key={player.id} className={"flex items-center gap-3 px-4 py-2.5 border-t border-white/5 " + (i === 0 ? "bg-goat/5" : "")}>
                    <span className="text-xs w-5 text-center shrink-0 text-white/40">{medal(i) || i + 1}</span>
                    <img src={player.entities.image_url} alt={player.entities.name} className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/10" />
                    <span className={"flex-1 text-sm font-medium truncate " + (i === 0 ? "text-goat" : "text-white/80")}>{player.entities.name}</span>
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden shrink-0">
                      <div className={"h-full rounded-full " + barColor} style={{ width: barPct + "%" }} />
                    </div>
                  </div>
                )
              })}
              <div className="px-4 py-3 border-t border-white/5">
                <a href={getDvelsHref()} className="text-xs text-goat hover:underline">See full ranking -></a>
              </div>
            </div>
          )}

          {activeMode === "rank" && activeRank4 && (
            <a href={"/rank4/" + activeRank4.id} className="block bg-white/5 border border-goat/20 rounded-2xl p-5 hover:border-goat/40 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-goat font-semibold uppercase tracking-wide">This week</span>
                <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">Open</span>
              </div>
              <p className="text-base font-semibold text-white mb-3">{activeRank4.title}</p>
              <div className="grid grid-cols-2 gap-2">
                {[activeRank4.option_1, activeRank4.option_2, activeRank4.option_3, activeRank4.option_4].map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-goat text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-xs text-white/60 truncate">{opt}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-goat mt-3 text-right">Vote now -></p>
            </a>
          )}

        </div>

        <div className="h-10" />
      </main>
    </>
  )
}
