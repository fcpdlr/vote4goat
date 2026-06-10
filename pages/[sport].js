import { useEffect, useState, useRef } from "react"
import Meta from "../components/Meta"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { supabase } from "../lib/supabase"

const K = 32

function expectedScore(rA, rB) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400))
}

const SPORTS = {
  football: {
    entityCategoryId: 1,
    label: "Football",
    metaTitle: "Football GOAT Ranking | Vote4GOAT",
    metaDesc: "Vote in 1v1 duels and shape the all-time football GOAT ranking. Updated in real time with every vote.",
    canonical: "https://vote4goat.com/football",
    shareTag: "#Vote4GOAT #GOAT #Football",
  },
  basketball: {
    entityCategoryId: 2,
    label: "Basketball",
    metaTitle: "Basketball GOAT Ranking | Vote4GOAT",
    metaDesc: "Vote in 1v1 duels and shape the all-time basketball GOAT ranking. Updated in real time with every vote.",
    canonical: "https://vote4goat.com/basketball",
    shareTag: "#Vote4GOAT #GOAT #Basketball",
  },
}

export default function SportPage({ sport, initialRanking }) {
  const config = SPORTS[sport]

  const [duel, setDuel] = useState([])
  const [ranking, setRanking] = useState(initialRanking.slice(0, 20))
  const [limit, setLimit] = useState(20)
  const [selected, setSelected] = useState(null)
  const [duelLimit, setDuelLimit] = useState(null)
  const [user, setUser] = useState(null)
  const [ipAddress, setIpAddress] = useState(null)
  const [voting, setVoting] = useState(false)
  const [topElo, setTopElo] = useState(initialRanking.length > 0 ? initialRanking[0].elo_rating : 1)
  const [impact, setImpact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fullRanking, setFullRanking] = useState(initialRanking)
  const [loginNudge, setLoginNudge] = useState(false)

  const helpRef = useRef()

  useEffect(() => {
    fetchDuel()
    checkUser()
    fetchIp()
  }, [])

  useEffect(() => {
    if (duelLimit === null) return
    fetchDuel()
    fetchRanking(limit)
  }, [duelLimit])

  useEffect(() => {
    function handleClickOutside(event) {
      if (helpRef.current && !helpRef.current.contains(event.target)) {}
    }
    function handleEsc(event) {}
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
      entity_category_input: config.entityCategoryId,
      limit_rank: duelLimit,
    })
    if (error) console.error("Error in fetchDuel:", error)
    setDuel(data || [])
    setLoading(false)
  }

  const fetchRanking = async (visibleLimit) => {
    const { data, error } = await supabase
      .from("entity_rankings")
      .select("id, elo_rating, entities (name, name_line1, name_line2, name_line3, image_url)")
      .eq("entity_category_id", config.entityCategoryId)
      .order("elo_rating", { ascending: false })
    if (error) console.error("Error in fetchRanking:", error)
    const results = data || []
    setFullRanking(results)
    setRanking(results.slice(0, visibleLimit))
    if (results.length > 0) setTopElo(results[0].elo_rating)
    return results
  }

  const vote = async (winnerId, loserId) => {
    if (voting) return
    setSelected(winnerId)
    setVoting(true)
    setImpact(null)

    const winner = duel.find(p => p.id === winnerId)
    const loser = duel.find(p => p.id === loserId)

    const rankingBefore = fullRanking.length > 0 ? [...fullRanking] : await fetchRanking(limit)
    const winnerBefore = rankingBefore.find(r => r.id === winnerId)
    const loserBefore = rankingBefore.find(r => r.id === loserId)
    const winnerEloBefore = winnerBefore?.elo_rating || 1200
    const loserEloBefore = loserBefore?.elo_rating || 1200
    const winnerRankBefore = winnerBefore ? rankingBefore.indexOf(winnerBefore) + 1 : null
    const loserRankBefore = loserBefore ? rankingBefore.indexOf(loserBefore) + 1 : null
    const eloChange = Math.round(K * (1 - expectedScore(winnerEloBefore, loserEloBefore)))

    let userId = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch (err) {}

    const { error } = await supabase.rpc("vote_and_update_elo", {
      winner_id_input: winnerId,
      loser_id_input: loserId,
      user_id_input: userId,
      ip_address_input: ipAddress,
    })

    if (error) {
      console.error("ERROR voting:", error)
      setVoting(false)
      setSelected(null)
      return
    }

    const rankingAfter = await fetchRanking(limit)

    const winnerAfter = rankingAfter.find(r => r.id === winnerId)
    const loserAfter = rankingAfter.find(r => r.id === loserId)
    const winnerRankAfter = winnerAfter ? rankingAfter.indexOf(winnerAfter) + 1 : null
    const loserRankAfter = loserAfter ? rankingAfter.indexOf(loserAfter) + 1 : null

    setImpact({
      winnerName: winner?.name_line2 || winner?.name_line1 || "Winner",
      loserName: loser?.name_line2 || loser?.name_line1 || "Loser",
      winnerImg: winner?.image_url,
      loserImg: loser?.image_url,
      eloChange,
      winnerRankBefore,
      winnerRankAfter,
      loserRankBefore,
      loserRankAfter,
      winnerClimbed: winnerRankBefore != null && winnerRankAfter != null && winnerRankAfter < winnerRankBefore,
      loserFell: loserRankBefore != null && loserRankAfter != null && loserRankAfter > loserRankBefore,
    })

    await new Promise(resolve => setTimeout(resolve, 700))
    await fetchDuel()
    setVoting(false)
  }

  const getShareText = () => {
    if (!impact) return ""
    return `My pick in the ${config.label.toLowerCase()} GOAT debate: ${impact.winnerName} over ${impact.loserName}. Do you agree? Vote now at vote4goat.com ${config.shareTag}`
  }

  const handleFilterClick = (f) => {
    if (f.auth && !user) {
      setLoginNudge(true)
      setTimeout(() => setLoginNudge(false), 3000)
      return
    }
    setDuelLimit(f.val)
  }

  return (
    <>
      <Meta
        title={config.metaTitle.replace(" | Vote4GOAT", "")}
        description={config.metaDesc}
        url={`/${sport}`}
        jsonLd={fullRanking.length > 0 ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": config.metaTitle,
          "description": config.metaDesc,
          "url": config.canonical,
          "numberOfItems": fullRanking.length,
          "itemListElement": fullRanking.slice(0, 20).map((item, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": item.entities?.name || [item.entities?.name_line1, item.entities?.name_line2, item.entities?.name_line3].filter(Boolean).join(" ")
          }))
        } : undefined}
      />

      <main className="min-h-screen bg-background text-white font-sans flex flex-col">

        <Header />

        <div className="px-4">
          <div className="text-center pt-6 pb-2">
            <p className="text-xs tracking-widest uppercase text-white/25 mb-1">{config.label} — All time</p>
            <h1 className="text-2xl font-extrabold text-white">Who is the <span className="text-goat">greatest?</span></h1>
          </div>

          <div className="flex flex-col items-center gap-1 mt-3 mb-4">
            <div className="flex justify-center gap-2">
              {[
                { label: "All Players", val: null },
                { label: "Top 100", val: 100, auth: true },
                { label: "Top 50", val: 50, auth: true },
              ].map(f => (
                <button
                  key={f.label}
                  onClick={() => handleFilterClick(f)}
                  className={"px-3 py-1 rounded-full text-xs border transition " + (duelLimit === f.val ? "bg-goat border-goat text-black font-bold" : (f.auth && !user ? "border-white/10 text-white/20 cursor-not-allowed" : "border-white/20 text-white/50 hover:border-white/40"))}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {loginNudge && (
              <p className="text-xs text-white/40 mt-0.5">
                <a href="/login" className="text-goat hover:underline">Log in</a> to filter by rank tier
              </p>
            )}
          </div>

          <div className="max-w-lg mx-auto w-full">

            {loading ? (
              <div className="flex gap-3">
                <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-52 animate-pulse" />
                <div className="flex items-center px-1">
                  <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
                </div>
                <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-52 animate-pulse" />
              </div>
            ) : duel.length === 2 ? (
              <div className="flex gap-3 items-stretch relative">
                {duel.map((player) => {
                  const isWinner = selected === player.id
                  const isLoser = selected !== null && selected !== player.id
                  const rank = fullRanking.findIndex(r => r.id === player.id)
                  const rankNum = rank >= 0 ? rank + 1 : null
                  return (
                    <button
                      key={player.id}
                      onClick={() => vote(player.id, duel.find(p => p.id !== player.id).id)}
                      disabled={voting}
                      className={"flex-1 rounded-2xl border overflow-hidden flex flex-col items-center gap-3 py-5 px-3 transition-all duration-300 focus:outline-none relative " +
                        (isWinner ? "border-goat bg-goat/5 scale-[1.02] shadow-[0_0_24px_rgba(245,166,35,0.2)]" :
                         isLoser ? "border-white/5 bg-white/[0.02] opacity-35 scale-[0.97]" :
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
                          loading="lazy"
                        />
                        {rankNum && (
                          <div className={"absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border " + (isWinner ? "bg-goat border-goat text-black" : "bg-background border-white/20 text-white/50")}>
                            {rankNum}
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        {player.name_line1 && <div className="text-[10px] text-white/35 uppercase tracking-wide">{player.name_line1}</div>}
                        <div className={"text-lg font-black leading-tight " + (isWinner ? "text-goat" : "text-white")}>{player.name_line2}</div>
                        {player.name_line3 && <div className={"text-lg font-black leading-tight " + (isWinner ? "text-goat" : "text-white")}>{player.name_line3}</div>}
                        {rankNum && <div className={"text-[10px] mt-1 font-semibold " + (isWinner ? "text-goat/70" : "text-white/25")}>#{rankNum} in ranking</div>}
                      </div>
                    </button>
                  )
                })}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="bg-goat text-black text-sm font-black w-10 h-10 flex items-center justify-center rounded-full shadow-lg">VS</div>
                </div>
              </div>
            ) : null}

            {impact && !voting && (
              <div className="mt-4">
                <div className="rounded-2xl border border-goat/20 overflow-hidden mb-3">
                  <div className="bg-goat/8 px-4 py-2.5 flex items-center gap-2 border-b border-goat/15">
                    <span className="text-sm">&#x26A1;</span>
                    <span className="text-sm font-bold text-goat">Your vote moved the ranking</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    <div className="flex items-center gap-3 px-4 py-3">
                      {impact.winnerImg && <img src={impact.winnerImg} className="w-8 h-8 rounded-full object-cover object-top border border-goat/30 flex-shrink-0" alt="" loading="lazy" />}
                      <span className="font-bold text-sm text-white flex-1 uppercase tracking-wide truncate">{impact.winnerName}</span>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className="text-xs font-bold text-green-400">+{impact.eloChange} pts</span>
                        {impact.winnerClimbed ? (
                          <span className="text-[10px] text-green-400/70">&#x2191; #{impact.winnerRankBefore} to #{impact.winnerRankAfter}</span>
                        ) : impact.winnerRankAfter ? (
                          <span className="text-[10px] text-white/25">stays #{impact.winnerRankAfter}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      {impact.loserImg && <img src={impact.loserImg} className="w-8 h-8 rounded-full object-cover object-top border border-white/10 flex-shrink-0 opacity-60" alt="" loading="lazy" />}
                      <span className="font-bold text-sm text-white/55 flex-1 uppercase tracking-wide truncate">{impact.loserName}</span>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className="text-xs font-bold text-red-400/80">-{impact.eloChange} pts</span>
                        {impact.loserFell ? (
                          <span className="text-[10px] text-red-400/60">&#x2193; #{impact.loserRankBefore} to #{impact.loserRankAfter}</span>
                        ) : impact.loserRankAfter ? (
                          <span className="text-[10px] text-white/25">stays #{impact.loserRankAfter}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-goat/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-goat text-sm flex-shrink-0">&#x2713;</span>
                    <p className="text-sm text-white/70 truncate">
                      You picked <span className="text-white font-semibold">{impact.winnerName}</span> over <span className="text-white/50">{impact.loserName}</span>
                    </p>
                  </div>
                  <a
                    href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(getShareText())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-black border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/5 transition flex-shrink-0"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Share
                  </a>
                </div>
              </div>
            )}

          </div>

          <div className="bg-background text-white px-4 py-8 mt-4 rounded-t-3xl">
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
                    const globalRank = fullRanking.findIndex(r => r.id === player.id)
                    const rankPos = globalRank >= 0 ? globalRank + 1 : i + 1
                    const medal = rankPos === 1 ? String.fromCodePoint(0x1F947) : rankPos === 2 ? String.fromCodePoint(0x1F948) : rankPos === 3 ? String.fromCodePoint(0x1F949) : null
                    const rowStyle = rankPos === 1 ? "bg-goat/10 font-bold" : rankPos === 2 ? "bg-white/5 font-semibold" : rankPos === 3 ? "bg-white/5" : ""
                    const nameColor = rankPos === 1 ? "text-goat" : rankPos === 2 ? "text-white/90" : rankPos === 3 ? "text-white/80" : "text-white/70"
                    const barPct = Math.round((player.elo_rating / topElo) * 100)
                    const barColor = rankPos === 1 ? "bg-goat" : rankPos === 2 ? "bg-gray-400" : rankPos === 3 ? "bg-amber-700" : "bg-white/20"
                    return (
                      <tr key={player.id} className={"border-t border-white/5 hover:bg-white/5 transition " + rowStyle}>
                        <td className="pl-2 pr-1 py-2.5 text-xs text-white/40 w-8">{medal || rankPos}</td>
                        <td className="pl-1 pr-2 py-2.5">
                          <div className="flex items-center gap-2">
                            <img src={player.entities.image_url} alt={player.entities.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white/10" loading="lazy" />
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
            {ranking.length < fullRanking.length && (
              <button
                className="mt-6 text-goat underline text-sm mx-auto block"
                onClick={() => {
                  const newLimit = limit + 20
                  setLimit(newLimit)
                  setRanking(fullRanking.slice(0, newLimit))
                }}
              >
                Show more
              </button>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}

export async function getServerSideProps({ params }) {
  const sport = params.sport
  if (!SPORTS[sport]) return { notFound: true }

  const config = SPORTS[sport]
  const { data } = await supabase
    .from("entity_rankings")
    .select("id, elo_rating, entities (name, name_line1, name_line2, name_line3, image_url)")
    .eq("entity_category_id", config.entityCategoryId)
    .order("elo_rating", { ascending: false })

  return { props: { sport, initialRanking: data || [] } }
}
