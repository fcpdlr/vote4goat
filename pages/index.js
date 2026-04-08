import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Head from "next/head"
import { Swords } from "lucide-react"
import Header from "../components/Header"
import Footer from "../components/Footer"

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
const [activeMode, setActiveMode] = useState("dvels")
const [ranking, setRanking] = useState([])
const [activeRank4, setActiveRank4] = useState(null)
const [topElo, setTopElo] = useState(1)

useEffect(() => {
const fetchRanking = async () => {
const { data } = await supabase
.from("entity_rankings")
.select("id, elo_rating, entities (name, image_url)")
.eq("entity_category_id", 1)
.order("elo_rating", { ascending: false })
.limit(5)
const results = data || []
setRanking(results)
if (results.length > 0) setTopElo(results[0].elo_rating)
}
if (activeMode === "dvels") fetchRanking()
}, [activeMode])

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

const medal = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null

const modes = [
{
id: "dvels",
label: ["D", "V", "E", "L", "S"],
accent: [1, 4],
desc: "Two players appear. You choose the greatest. Every vote shapes the ranking.",
cta: "Start voting",
icon: (active) => <Swords size={22} strokeWidth={1.5} className={active ? "text-goat" : "text-white/40"} />,
},
{
id: "tops",
label: ["T", "1", "0", "P", "S"],
accent: [1, 2],
desc: "Select the category and build your Top 10. Save it, share it and compare with the world.",
cta: "Build your Top 10",
href: "/top10",
icon: (active) => <TopsIcon active={active} />,
},
{
id: "rank",
label: ["R", "4", "N", "K"],
accent: [1],
desc: "Four options, you rank them. New debate every week.",
cta: "See this week",
href: "/rank4",
icon: (active) => <RankIcon active={active} />,
},
]

const activeM = modes.find(m => m.id === activeMode)

return (
<>
<Head>
<title>Vote4GOAT — The world decides who is the GOAT</title>
<meta name="description" content="Vote in 1v1 duels, build your Top 10 and rank the greatest athletes of all time. The only ranking built by the world." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://vote4goat.com" />
<meta property="og:type" content="website" />
<meta property="og:title" content="Vote4GOAT — The world decides who is the GOAT" />
<meta property="og:description" content="Vote in 1v1 duels, build your Top 10 and rank the greatest athletes of all time. The only ranking built by the world." />
<meta property="og:url" content="https://vote4goat.com" />
<meta property="og:image" content="https://vote4goat.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Vote4GOAT" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Vote4GOAT — The world decides who is the GOAT" />
<meta name="twitter:description" content="Vote in 1v1 duels, build your Top 10 and rank the greatest athletes of all time. The only ranking built by the world." />
<meta name="twitter:image" content="https://vote4goat.com/og-image.png" />
<link rel="icon" href="/favicon.ico" />
</Head>


  <main className="min-h-screen bg-background text-white font-sans flex flex-col">

    <Header />

    {/* HERO */}
    <div className="relative px-4 pt-12 pb-10 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-goat/[0.06] blur-3xl" />
      </div>

      <p className="relative text-[10px] tracking-[0.35em] uppercase text-white/20 mb-4 font-medium">
        Football · The world decides
      </p>

      <h1 className="relative leading-[0.9] mb-6">
        <span className="block font-black text-white uppercase"
          style={{ fontSize: "clamp(52px, 14vw, 80px)", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.02em" }}>
          WHO IS
        </span>
        <span className="block font-black text-goat uppercase"
          style={{ fontSize: "clamp(64px, 18vw, 104px)", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.02em" }}>
          THE GOAT?
        </span>
      </h1>

      <p className="relative text-sm text-white/30 max-w-[260px] mx-auto leading-relaxed mb-8">
        Vote in duels, build your Top 10 or settle the weekly debate.
      </p>

      <div className="relative flex items-center justify-center gap-3">
        <a href="/football" className="bg-goat text-black px-6 py-3 rounded-full text-sm font-black tracking-wide hover:brightness-110 transition">
          Start voting →
        </a>
        <a href="/top10" className="border border-white/10 text-white/40 px-5 py-3 rounded-full text-sm font-semibold hover:border-white/25 hover:text-white/60 transition">
          Build Top 10
        </a>
      </div>
    </div>

    {/* MODE SELECTOR */}
    <div className="max-w-lg mx-auto w-full px-4 mb-4">
      <div className="flex gap-2">
        {modes.map((mode) => {
          const active = activeMode === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={"flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition relative " + (active ? "bg-white/5 border-goat/30" : "bg-transparent border-white/8 hover:bg-white/[0.03] hover:border-white/15")}
            >
              <div className={"w-11 h-11 rounded-xl flex items-center justify-center border transition " + (active ? "bg-goat/10 border-goat/30" : "bg-white/[0.03] border-white/8")}>
                {mode.icon(active)}
              </div>
              <div className="text-base font-black tracking-wider leading-none" style={{ fontFamily: "system-ui, sans-serif" }}>
                {mode.label.map((letter, i) => (
                  <span key={i} className={mode.accent.includes(i) ? "text-goat" : (active ? "text-white" : "text-white/40")}>
                    {letter}
                  </span>
                ))}
              </div>
              {active && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-goat rounded-full" />}
            </button>
          )
        })}
      </div>
    </div>

    {/* MODE CONTENT */}
    <div className="max-w-lg mx-auto w-full px-4 flex-1">

      {activeM && (
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5 mb-4">
          <p className="text-sm text-white/60 mb-4 leading-relaxed">{activeM.desc}</p>
          <a
            href={activeM.id === "dvels" ? "/football" : activeM.href}
            className="block w-full py-2.5 rounded-xl text-sm font-bold text-center bg-goat text-black hover:brightness-110 transition"
          >
            {activeM.cta} →
          </a>
        </div>
      )}

      {/* Mini ranking — DVELS */}
      {activeMode === "dvels" && ranking.length > 0 && (
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">Current ranking</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/25">live</span>
            </div>
          </div>
          {ranking.map((player, i) => {
            const barPct = Math.round((player.elo_rating / topElo) * 100)
            const barColor = i === 0 ? "bg-goat" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-white/20"
            return (
              <div key={player.id} className={"flex items-center gap-3 px-4 py-2.5 border-t border-white/5 " + (i === 0 ? "bg-goat/[0.04]" : "")}>
                <span className="text-xs w-5 text-center shrink-0 text-white/30">{medal(i) || i + 1}</span>
                <img src={player.entities.image_url} alt={player.entities.name} className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/10" />
                <span className={"flex-1 text-sm font-medium truncate " + (i === 0 ? "text-goat" : "text-white/70")}>{player.entities.name}</span>
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden shrink-0">
                  <div className={"h-full rounded-full " + barColor} style={{ width: barPct + "%" }} />
                </div>
              </div>
            )
          })}
          <div className="px-4 py-3 border-t border-white/5">
            <a href="/football" className="text-xs text-goat hover:underline">See full ranking →</a>
          </div>
        </div>
      )}

      {/* Active R4NK */}
      {activeMode === "rank" && activeRank4 && (
        <a href={"/rank4/" + activeRank4.id} className="block bg-white/[0.04] border border-white/8 rounded-2xl p-5 hover:border-goat/20 transition mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-goat font-semibold uppercase tracking-wide">This week</span>
            <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">Open</span>
          </div>
          <p className="text-base font-semibold text-white mb-3">{activeRank4.title}</p>
          <div className="grid grid-cols-2 gap-2">
            {[activeRank4.option_1, activeRank4.option_2, activeRank4.option_3, activeRank4.option_4].map((opt, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                <span className="text-goat text-xs font-bold shrink-0">{i + 1}</span>
                <span className="text-xs text-white/50 truncate">{opt}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-goat mt-3 text-right">Vote now →</p>
        </a>
      )}

    </div>

    <Footer />
  </main>
</>


)
}