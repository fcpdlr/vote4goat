import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import Head from "next/head"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function FootballPage() {
const [duel, setDuel] = useState([])
const [ranking, setRanking] = useState([])
const [limit, setLimit] = useState(20)
const [selected, setSelected] = useState(null)
const [showHelp, setShowHelp] = useState(false)
const [duelLimit, setDuelLimit] = useState(null)
const [user, setUser] = useState(null)
const [ipAddress, setIpAddress] = useState(null)
const [showMenu, setShowMenu] = useState(false)
const [voting, setVoting] = useState(false)
const [topElo, setTopElo] = useState(1)
const [impact, setImpact] = useState(null)
const [sessionVotes, setSessionVotes] = useState(0)
const [loading, setLoading] = useState(true)

const ENTITY_CATEGORY_ID = 1
const menuRef = useRef()
const helpRef = useRef()

useEffect(() => {
fetchDuel()
fetchRanking(20)
checkUser()
fetchIp()
}, [duelLimit])

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

const checkUser = async () => {
try {
const { data: { user } } = await supabase.auth.getUser()
setUser(user)
} catch (err) {}
}

const fetchIp = async () => {
try {
const res = await fetch("https://api.ipify.org?format=json")
const data = await res.json()
setIpAddress(data.ip)
} catch (e) {}
}

const fetchDuel = async () => {
setSelected(null)
setLoading(true)
const { data, error } = await supabase.rpc("get_duel", {
entity_category_input: ENTITY_CATEGORY_ID,
limit_rank: duelLimit,
})
if (error) console.error("Error in fetchDuel:", error)
setDuel(data || [])
setLoading(false)
}

const fetchRanking = async (top) => {
const { data, error } = await supabase
.from("entity_rankings")
.select("id, elo_rating, entities (name, name_line1, name_line2, name_line3, image_url)")
.eq("entity_category_id", ENTITY_CATEGORY_ID)
.order("elo_rating", { ascending: false })
.limit(top)
if (error) console.error("Error in fetchRanking:", error)
const results = data || []
setRanking(results)
if (results.length > 0) setTopElo(results[0].elo_rating)
}

const getRankBefore = (playerId) => {
const idx = ranking.findIndex(r => r.id === playerId)
return idx >= 0 ? idx + 1 : null
}

const vote = async (winnerId, loserId) => {
if (voting) return
setSelected(winnerId)
setVoting(true)


const winner = duel.find(p => p.id === winnerId)
const loser = duel.find(p => p.id === loserId)

const winnerRankBefore = getRankBefore(winnerId)
const loserRankBefore = getRankBefore(loserId)

const winnerEloBefore = ranking.find(r => r.id === winnerId)?.elo_rating || 1200
const loserEloBefore = ranking.find(r => r.id === loserId)?.elo_rating || 1200

let userId = null
try {
  const { data: { user } } = await supabase.auth.getUser()
  userId = user?.id || null
} catch (err) {}

const { error } = await supabase.rpc("vote_and_update_elo", {
  winner_id_input: winnerId,
  loser_id_input: loserId,
  user_id_input: userId,
  ip_address_input: ipAddress
})

if (error) {
  console.error("ERROR voting:", error)
  setVoting(false)
  setSelected(null)
  return
}

setSessionVotes(v => v + 1)

await fetchRanking(limit)

const winnerEloAfter = ranking.find(r => r.id === winnerId)?.elo_rating || winnerEloBefore
const loserEloAfter = ranking.find(r => r.id === loserId)?.elo_rating || loserEloBefore
const winnerRankAfter = getRankBefore(winnerId)
const loserRankAfter = getRankBefore(loserId)

const eloGain = Math.round(Math.abs(winnerEloAfter - winnerEloBefore)) || 18
const eloLoss = eloGain

const winnerClimbed = winnerRankBefore && winnerRankAfter && winnerRankAfter < winnerRankBefore
const loserFell = loserRankBefore && loserRankAfter && loserRankAfter > loserRankBefore

setImpact({
  winnerName: winner?.name_line2 || winner?.name_line1 || "Winner",
  loserName: loser?.name_line2 || loser?.name_line1 || "Loser",
  winnerImg: winner?.image_url,
  loserImg: loser?.image_url,
  eloGain,
  eloLoss,
  winnerRankBefore,
  winnerRankAfter,
  loserRankBefore,
  loserRankAfter,
  winnerClimbed,
  loserFell,
})

await new Promise(resolve => setTimeout(resolve, 700))
await fetchDuel()
setVoting(false)


}

const winnerRank = duel.length === 2 ? ranking.findIndex(r => r.id === duel[0]?.id) + 1 : null
const loserRank = duel.length === 2 ? ranking.findIndex(r => r.id === duel[1]?.id) + 1 : null

const getStreakLabel = () => {
if (sessionVotes >= 20) return "20 +"
if (sessionVotes >= 10) return String(sessionVotes)
if (sessionVotes >= 5) return String(sessionVotes)
return String(sessionVotes)
}

return (
<>
<Head>
<title>Football GOAT Ranking | Vote4GOAT</title>
<meta name="description" content="Vote in 1v1 duels and shape the all-time football GOAT ranking. Updated in real time with every vote." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://vote4goat.com/football" />
<meta property="og:type" content="website" />
<meta property="og:title" content="Football GOAT Ranking | Vote4GOAT" />
<meta property="og:description" content="Vote in 1v1 duels and shape the all-time football GOAT ranking. Updated in real time with every vote." />
<meta property="og:url" content="https://vote4goat.com/football" />
<meta property="og:image" content="https://vote4goat.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Vote4GOAT" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Football GOAT Ranking | Vote4GOAT" />
<meta name="twitter:description" content="Vote in 1v1 duels and shape the all-time football GOAT ranking. Updated in real time with every vote." />
<meta name="twitter:image" content="https://vote4goat.com/og-image.png" />
<link rel="icon" href="/favicon.ico" />
</Head>


  <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">

    {/* HEADER */}
    <header className="flex items-center justify-between px-3 py-2">
      <a href="/" className="text-xl sm:text-2xl font-bold text-white hover:opacity-80 transition">Vote4GOAT</a>
      <nav className="flex items-center gap-3 text-xs sm:text-sm">
        {sessionVotes > 0 && (
          <div className="flex items-center gap-1.5 bg-goat/10 border border-goat/25 rounded-full px-2.5 py-1">
            <span className="text-xs">&#x1F525;</span>
            <span className="text-xs font-bold text-goat">{getStreakLabel()}</span>
          </div>
        )}
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
        <p className="mb-2">Two players appear. You pick the greatest. Every vote updates the ranking using Elo -- the same system used in chess.</p>
        <p className="mt-4 font-semibold text-goat">Start voting. Shape the GOAT list.</p>
      </div>
    )}

    {/* CONTEXT */}
    <div className="text-center pt-6 pb-2">
      <p className="text-xs tracking-widest uppercase text-white/25 mb-1">Football - All time</p>
      <h1 className="text-2xl font-extrabold text-white">Who is the <span className="text-goat">greatest?</span></h1>
    </div>

    {/* FILTER */}
    <div className="flex justify-center gap-2 mt-3 mb-4">
      {[
        { label: "All Players", val: null },
        { label: "Top 100", val: 100, auth: true },
        { label: "Top 50", val: 50, auth: true },
      ].map(f => (
        <button
          key={f.label}
          onClick={() => { if (f.auth && !user) { alert("Please log in to use this filter."); return } setDuelLimit(f.val) }}
          className={"px-3 py-1 rounded-full text-xs border transition " + (duelLimit === f.val ? "bg-goat border-goat text-black font-bold" : (f.auth && !user ? "border-white/10 text-white/20 cursor-not-allowed" : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/80"))}
        >
          {f.label}
        </button>
      ))}
    </div>

    {/* DUEL */}
    <div className="max-w-lg mx-auto w-full px-1">

      {loading ? (
        /* SKELETON */
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-48 animate-pulse" />
          <div className="flex items-center px-2 pb-8">
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          </div>
          <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-48 animate-pulse" />
        </div>
      ) : duel.length === 2 ? (
        <div className="flex gap-3 items-stretch relative">
          {duel.map((player, idx) => {
            const isWinner = selected === player.id
            const isLoser = selected !== null && selected !== player.id
            const rank = idx === 0 ? (ranking.findIndex(r => r.id === player.id) + 1 || null) : (ranking.findIndex(r => r.id === player.id) + 1 || null)
            return (
              <button
                key={player.id}
                onClick={() => vote(player.id, duel.find(p => p.id !== player.id).id)}
                disabled={voting}
                className={"flex-1 rounded-2xl border overflow-hidden flex flex-col items-center gap-3 py-5 px-3 transition-all duration-300 focus:outline-none relative " +
                  (isWinner ? "border-goat bg-goat/8 scale-[1.02] shadow-[0_0_24px_rgba(245,166,35,0.25)]" :
                   isLoser ? "border-white/5 bg-white/[0.02] opacity-40 scale-[0.97]" :
                   "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.98]")}
              >
                {isWinner && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-goat flex items-center justify-center text-black text-xs font-black">&#x2713;</div>
                )}
                <div className="relative">
                  <img
                    src={player.image_url}
                    alt={player.name_line2 || player.name_line1}
                    className={"w-20 h-20 rounded-full object-cover object-top border-2 " + (isWinner ? "border-goat" : "border-white/15")}
                  />
                  {rank > 0 && (
                    <div className={"absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border " + (isWinner ? "bg-goat border-goat text-black" : "bg-background border-white/20 text-white/50")}>
                      {rank}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  {player.name_line1 && <div className="text-[10px] text-white/35 uppercase tracking-wide">{player.name_line1}</div>}
                  <div className={"text-lg font-black leading-tight " + (isWinner ? "text-goat" : "text-white")}>{player.name_line2}</div>
                  {player.name_line3 && <div className={"text-lg font-black leading-tight " + (isWinner ? "text-goat" : "text-white")}>{player.name_line3}</div>}
                </div>
                <div className={"w-full py-2 rounded-xl text-xs font-bold tracking-wide text-center border transition " + (isWinner ? "bg-goat border-goat text-black" : "bg-white/5 border-white/10 text-white/40")}>
                  {isWinner ? "Your pick" : "Pick him"}
                </div>
              </button>
            )
          })}

          {/* VS badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="bg-goat text-black text-sm font-black w-10 h-10 flex items-center justify-center rounded-full shadow-lg">VS</div>
          </div>
        </div>
      ) : null}



    </div>



    {/* IMPACT PANEL */}
    {impact && !voting && (
      <div className="max-w-lg mx-auto w-full px-1 mb-4">
        <div className="rounded-2xl border border-goat/20 overflow-hidden">
          <div className="bg-goat/8 px-4 py-3 flex items-center gap-2 border-b border-goat/15">
            <span className="text-sm">&#x26A1;</span>
            <span className="text-sm font-bold text-goat">Your vote moved the ranking</span>
          </div>
          <div className="divide-y divide-white/5">
            <div className="flex items-center gap-3 px-4 py-3">
              {impact.winnerImg && <img src={impact.winnerImg} className="w-8 h-8 rounded-full object-cover object-top border border-goat/30 flex-shrink-0" alt=""/>}
              <span className="font-bold text-sm text-white flex-1 uppercase tracking-wide">{impact.winnerName}</span>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-bold text-green-400">+{impact.eloGain} pts</span>
                {impact.winnerClimbed && impact.winnerRankBefore && impact.winnerRankAfter ? (
                  <span className="text-[10px] text-green-400/70">&#x2191; #{impact.winnerRankBefore} &#x2192; #{impact.winnerRankAfter}</span>
                ) : (
                  <span className="text-[10px] text-white/25">{impact.winnerRankAfter ? "stays #" + impact.winnerRankAfter : ""}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              {impact.loserImg && <img src={impact.loserImg} className="w-8 h-8 rounded-full object-cover object-top border border-white/10 flex-shrink-0 opacity-60" alt=""/>}
              <span className="font-bold text-sm text-white/60 flex-1 uppercase tracking-wide">{impact.loserName}</span>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-bold text-red-400/80">-{impact.eloLoss} pts</span>
                {impact.loserFell && impact.loserRankBefore && impact.loserRankAfter ? (
                  <span className="text-[10px] text-red-400/60">&#x2193; #{impact.loserRankBefore} &#x2192; #{impact.loserRankAfter}</span>
                ) : (
                  <span className="text-[10px] text-white/25">{impact.loserRankAfter ? "stays #" + impact.loserRankAfter : ""}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* RANKING */}
    <div className="bg-background text-white px-4 py-8 mt-2 rounded-t-3xl">
      <div className="flex items-center justify-center gap-2 mb-6">
        <h2 className="text-xl font-bold">Current Ranking</h2>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/40 text-xs">live</span>
        </div>
      </div>
      <div className="flex justify-center">
        <table className="w-full max-w-md text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2 text-goat text-left text-xs w-8">#</th>
              <th className="px-2 py-2 text-goat text-left text-xs">Player</th>
              <th className="px-2 py-2 text-goat text-right text-xs w-14">PTS</th>
              <th className="px-2 py-2 text-xs w-16 sm:w-28"></th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((player, i) => {
              const medal = i === 0 ? String.fromCodePoint(0x1F947) : i === 1 ? String.fromCodePoint(0x1F948) : i === 2 ? String.fromCodePoint(0x1F949) : null
              const rowStyle = i === 0 ? "bg-goat/10 font-bold" : i === 1 ? "bg-white/5 font-semibold" : i === 2 ? "bg-white/5" : ""
              const nameColor = i === 0 ? "text-goat" : i === 1 ? "text-white/90" : i === 2 ? "text-white/80" : "text-white/70"
              const barPct = Math.round((player.elo_rating / topElo) * 100)
              const barColor = i === 0 ? "bg-goat" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-white/20"
              return (
                <tr key={player.id} className={"border-t border-white/5 hover:bg-white/5 transition " + rowStyle}>
                  <td className="pl-2 pr-1 py-2.5 text-xs text-white/40 w-8">{medal || i + 1}</td>
                  <td className="pl-1 pr-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <img src={player.entities.image_url} alt={player.entities.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white/10" />
                      <span className={"truncate text-sm font-semibold " + nameColor}>{player.entities.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right text-xs text-white/40 w-14">{Math.round(player.elo_rating)}</td>
                  <td className="px-2 py-2.5 w-16 sm:w-28">
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className={"h-1.5 rounded-full " + barColor} style={{ width: barPct + "%" }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {ranking.length >= limit && limit < 100 && (
        <button className="mt-6 text-goat underline text-sm mx-auto block" onClick={() => { const n = limit + 20; setLimit(n); fetchRanking(n) }}>Show more</button>
      )}
    </div>

  </main>
</>


)
}