import Meta from "../../components/Meta"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { supabase } from "../../lib/supabase"
import { SPORTS, sportForCategoryId } from "../../lib/sports"

function displayName(entity) {
  return entity.name || [entity.name_line1, entity.name_line2, entity.name_line3].filter(Boolean).join(" ")
}

export default function PlayerPage({
  sport,
  config,
  entity,
  ranking,
  rankPosition,
  totalInCategory,
  winRate,
  totalDuels,
  recentDuels,
  prevPlayer,
  nextPlayer,
  canonicalUrl,
}) {
  const name = displayName(entity)
  const elo = Math.round(ranking.elo_rating)
  const question = `Is ${name} the GOAT of ${config.label.toLowerCase()}?`
  const answer = `${name} ranks #${rankPosition} of ${totalInCategory} in the Vote4GOAT ${config.label.toLowerCase()} ranking, with a ${elo} Elo rating${
    winRate != null ? ` and a ${winRate}% win rate across ${totalDuels} head-to-head duels` : ""
  } voted on by fans worldwide.`
  const metaTitle = `${name} — ${config.label} GOAT Ranking`
  const metaDesc = answer

  return (
    <>
      <Meta
        title={metaTitle}
        description={metaDesc}
        url={`/${sport}/${entity.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "name": name,
              "image": entity.image_url,
              ...(entity.country_primary ? { "nationality": entity.country_primary } : {}),
              "url": canonicalUrl,
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": question,
                  "acceptedAnswer": { "@type": "Answer", "text": answer },
                },
              ],
            },
          ],
        }}
      />

      <main className="min-h-screen bg-background text-white font-sans flex flex-col">
        <Header />

        <div className="px-4 pt-6 max-w-md mx-auto w-full">
          <nav className="text-xs text-white/30 mb-4">
            <a href="/" className="hover:text-white/60 transition">Home</a>
            <span className="mx-1.5">/</span>
            <a href={`/${sport}`} className="hover:text-white/60 transition">{config.label}</a>
            <span className="mx-1.5">/</span>
            <span className="text-white/50">{name}</span>
          </nav>

          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={entity.image_url}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-2 border-goat/40 mb-3"
            />
            <p className="text-xs tracking-widest uppercase text-white/25 mb-1">{config.label}</p>
            <h1 className="text-2xl font-extrabold text-white">{name}</h1>
            <p className="text-sm text-white/40 mt-1">
              Ranked <span className="text-goat font-bold">#{rankPosition}</span> of {totalInCategory}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl py-3 text-center">
              <div className="text-lg font-black text-goat">{elo}</div>
              <div className="text-[10px] uppercase tracking-wide text-white/30 mt-0.5">Elo Rating</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl py-3 text-center">
              <div className="text-lg font-black text-goat">{winRate != null ? `${winRate}%` : "—"}</div>
              <div className="text-[10px] uppercase tracking-wide text-white/30 mt-0.5">Win Rate</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl py-3 text-center">
              <div className="text-lg font-black text-goat">{totalDuels}</div>
              <div className="text-[10px] uppercase tracking-wide text-white/30 mt-0.5">Duels</div>
            </div>
          </div>

          <p className="text-sm text-white/60 leading-relaxed mb-6">{answer}</p>

          <a
            href={`/${sport}`}
            className="block text-center bg-goat text-black font-bold px-4 py-3 rounded-full hover:brightness-105 transition mb-8"
          >
            Vote in a duel &rarr;
          </a>

          {recentDuels.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-white/70 mb-3">Recent duels</h2>
              <div className="flex flex-col gap-2">
                {recentDuels.map((duel) => (
                  <div
                    key={duel.id}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={
                          "text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 " +
                          (duel.won ? "bg-green-400/15 text-green-400" : "bg-red-400/15 text-red-400/80")
                        }
                      >
                        {duel.won ? "W" : "L"}
                      </span>
                      {duel.opponent?.slug ? (
                        <a href={`/${sport}/${duel.opponent.slug}`} className="text-xs text-white/60 truncate hover:text-white transition">
                          vs {duel.opponent.name}
                        </a>
                      ) : (
                        <span className="text-xs text-white/60 truncate">vs {duel.opponent?.name || "Unknown"}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/25 flex-shrink-0">
                      {new Date(duel.timestamp).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-stretch gap-2 mb-10">
            {prevPlayer ? (
              <a
                href={`/${sport}/${prevPlayer.slug}`}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-left hover:bg-white/10 transition"
              >
                <div className="text-[10px] uppercase tracking-wide text-white/25">&larr; Higher rank</div>
                <div className="text-xs font-semibold text-white/70 truncate">{prevPlayer.name}</div>
              </a>
            ) : <div className="flex-1" />}
            {nextPlayer ? (
              <a
                href={`/${sport}/${nextPlayer.slug}`}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-right hover:bg-white/10 transition"
              >
                <div className="text-[10px] uppercase tracking-wide text-white/25">Lower rank &rarr;</div>
                <div className="text-xs font-semibold text-white/70 truncate">{nextPlayer.name}</div>
              </a>
            ) : <div className="flex-1" />}
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}

export async function getStaticPaths() {
  const { data } = await supabase
    .from("entity_rankings")
    .select("entity_category_id, entities(slug)")

  const paths = (data || [])
    .filter((row) => row.entities?.slug)
    .map((row) => {
      const sport = sportForCategoryId(row.entity_category_id)
      return sport ? { params: { sport, jugador: row.entities.slug } } : null
    })
    .filter(Boolean)

  return { paths, fallback: "blocking" }
}

export async function getStaticProps({ params }) {
  const { sport, jugador } = params
  const config = SPORTS[sport]
  if (!config) return { notFound: true }

  const { data: entity } = await supabase
    .from("entities")
    .select("id, name, name_line1, name_line2, name_line3, image_url, slug, country_primary")
    .eq("slug", jugador)
    .maybeSingle()
  if (!entity) return { notFound: true }

  const { data: ranking } = await supabase
    .from("entity_rankings")
    .select("id, elo_rating, wins, losses, entity_category_id")
    .eq("entity_id", entity.id)
    .eq("entity_category_id", config.entityCategoryId)
    .maybeSingle()
  if (!ranking) return { notFound: true }

  const [{ count: better }, { count: totalInCategory }] = await Promise.all([
    supabase
      .from("entity_rankings")
      .select("id", { count: "exact", head: true })
      .eq("entity_category_id", config.entityCategoryId)
      .gt("elo_rating", ranking.elo_rating),
    supabase
      .from("entity_rankings")
      .select("id", { count: "exact", head: true })
      .eq("entity_category_id", config.entityCategoryId),
  ])
  const rankPosition = (better || 0) + 1

  const totalDuels = ranking.wins + ranking.losses
  const winRate = totalDuels > 0 ? Math.round((ranking.wins / totalDuels) * 1000) / 10 : null

  const { data: recentRaw } = await supabase
    .from("votes_new")
    .select("id, timestamp, winner_ranking_id, loser_ranking_id")
    .or(`winner_ranking_id.eq.${ranking.id},loser_ranking_id.eq.${ranking.id}`)
    .order("timestamp", { ascending: false })
    .limit(6)

  let recentDuels = []
  if (recentRaw?.length > 0) {
    const opponentIds = [
      ...new Set(recentRaw.map((d) => (d.winner_ranking_id === ranking.id ? d.loser_ranking_id : d.winner_ranking_id))),
    ]
    const { data: opponents } = await supabase
      .from("entity_rankings")
      .select("id, entities(name, slug)")
      .in("id", opponentIds)
    const opponentMap = Object.fromEntries((opponents || []).map((o) => [o.id, o.entities]))
    recentDuels = recentRaw.map((d) => {
      const won = d.winner_ranking_id === ranking.id
      const opponentId = won ? d.loser_ranking_id : d.winner_ranking_id
      return { id: d.id, timestamp: d.timestamp, won, opponent: opponentMap[opponentId] }
    })
  }

  const [{ data: prevRow }, { data: nextRow }] = await Promise.all([
    supabase
      .from("entity_rankings")
      .select("elo_rating, entities(name, slug)")
      .eq("entity_category_id", config.entityCategoryId)
      .lt("elo_rating", ranking.elo_rating)
      .order("elo_rating", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("entity_rankings")
      .select("elo_rating, entities(name, slug)")
      .eq("entity_category_id", config.entityCategoryId)
      .gt("elo_rating", ranking.elo_rating)
      .order("elo_rating", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  return {
    props: {
      sport,
      config,
      entity,
      ranking,
      rankPosition,
      totalInCategory: totalInCategory || 0,
      winRate,
      totalDuels,
      recentDuels,
      prevPlayer: prevRow ? prevRow.entities : null,
      nextPlayer: nextRow ? nextRow.entities : null,
      canonicalUrl: `${config.canonical}/${entity.slug}`,
    },
    revalidate: 300,
  }
}
