import Meta from "../../components/Meta"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { supabase } from "../../lib/supabase"
import { SPORTS, sportForCategoryId } from "../../lib/sports"

const NEARBY_WINDOW = 3

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
  movement,
  totalVotesInCategory,
  topPlayer,
  nearby,
  canonicalUrl,
}) {
  const name = displayName(entity)
  const elo = Math.round(ranking.elo_rating)
  const question = `Is ${name} the GOAT of ${config.label.toLowerCase()}?`
  const answer = `${name} ranks #${rankPosition} of ${totalInCategory} in the Vote4GOAT ${config.label.toLowerCase()} ranking${
    winRate != null ? `, with a ${elo} Elo rating and a ${winRate}% win rate` : `, with a ${elo} Elo rating`
  } voted on by fans worldwide.`
  const metaTitle = `${name} — ${config.label} GOAT Ranking`
  const metaDesc = answer
  const shareText = `${name} ranks #${rankPosition} in the Vote4GOAT ${config.label.toLowerCase()} GOAT ranking. Do you agree? ${config.shareTag}`

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
              {movement > 0 && <span className="text-green-400 font-semibold ml-1.5">&#x2191;{movement} this week</span>}
              {movement < 0 && <span className="text-red-400/80 font-semibold ml-1.5">&#x2193;{-movement} this week</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl py-3 text-center">
              <div className="text-lg font-black text-goat">{elo}</div>
              <div className="text-[10px] uppercase tracking-wide text-white/30 mt-0.5">Elo Rating</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl py-3 text-center">
              <div className="text-lg font-black text-goat">{winRate != null ? `${winRate}%` : "—"}</div>
              <div className="text-[10px] uppercase tracking-wide text-white/30 mt-0.5">Win Rate</div>
            </div>
          </div>

          <p className="text-sm text-white/60 leading-relaxed mb-2">{answer}</p>
          {totalVotesInCategory > 0 && (
            <p className="text-xs text-white/30 mb-6">
              Part of {totalVotesInCategory.toLocaleString("en")} votes cast in the {config.label.toLowerCase()} ranking so far.
            </p>
          )}

          <a
            href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-black border border-white/10 px-4 py-2.5 rounded-full text-xs font-medium hover:bg-white/5 transition mb-8"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share
          </a>

          <div className="mb-10">
            <h2 className="text-sm font-bold text-white/70 mb-3">Ranking context</h2>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              {topPlayer && (
                <>
                  <a
                    href={`/${sport}/${topPlayer.slug}`}
                    className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition border-b border-white/5"
                  >
                    <span className="text-xs text-white/50 w-8">#{topPlayer.rank}</span>
                    <span className="text-xs font-semibold text-white/70 truncate flex-1 text-right">{topPlayer.name}</span>
                  </a>
                  <div className="text-center text-white/20 text-xs py-1 border-b border-white/5">&#183;&#183;&#183;</div>
                </>
              )}
              {nearby.map((row) =>
                row.isCurrent ? (
                  <div
                    key={row.rank}
                    className="flex items-center justify-between px-3 py-2 bg-goat/10 border-b border-white/5 last:border-0"
                  >
                    <span className="text-xs text-goat font-bold w-8">#{row.rank}</span>
                    <span className="text-xs font-bold text-goat truncate flex-1 text-right">{row.name}</span>
                  </div>
                ) : (
                  <a
                    key={row.rank}
                    href={`/${sport}/${row.slug}`}
                    className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                  >
                    <span className="text-xs text-white/50 w-8">#{row.rank}</span>
                    <span className="text-xs text-white/70 truncate flex-1 text-right">{row.name}</span>
                  </a>
                )
              )}
            </div>
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

  // Fetch the whole category ordered by Postgres itself and locate this
  // player by index, instead of re-querying with elo_rating as a filter:
  // that value round-trips through a JS float and loses precision (the
  // column stores far more decimal digits than a JS number can hold), which
  // made a player's own row occasionally count as "greater than itself".
  const { data: categoryList } = await supabase
    .from("entity_rankings")
    .select("id, entity_id, elo_rating, wins, losses, entities(name, slug)")
    .eq("entity_category_id", config.entityCategoryId)
    .order("elo_rating", { ascending: false })

  const index = (categoryList || []).findIndex((r) => r.entity_id === entity.id)
  if (index === -1) return { notFound: true }
  const ranking = categoryList[index]
  const rankPosition = index + 1
  const totalInCategory = categoryList.length

  // wins/losses can be skewed by one-off manual corrections (e.g. an admin
  // running manual duels to stabilize a player's rating), so only win rate
  // is shown — never the raw duel count, which isn't comparable across
  // players when that's happened.
  const totalDuels = ranking.wins + ranking.losses
  const winRate = totalDuels > 0 ? Math.round((ranking.wins / totalDuels) * 1000) / 10 : null

  let start = Math.max(0, index - NEARBY_WINDOW)
  if (start === 1) start = 0
  const end = Math.min(categoryList.length - 1, index + NEARBY_WINDOW)
  const nearby = categoryList.slice(start, end + 1).map((r, i) => ({
    rank: start + i + 1,
    name: r.entities.name,
    slug: r.entities.slug,
    isCurrent: r.entity_id === entity.id,
  }))
  const topPlayer = start > 1
    ? { rank: 1, name: categoryList[0].entities.name, slug: categoryList[0].entities.slug }
    : null

  // Weekly movement — same "at least 3 days old" comparison [sport].js uses,
  // so an arrow keeps showing week-over-week movement right after a fresh
  // snapshot. Empty/absent until ranking_snapshots builds up history.
  let movement = 0
  const threeDaysAgo = new Date(Date.now() - 3 * 864e5).toISOString()
  const { data: snapRows } = await supabase
    .from("ranking_snapshots")
    .select("rank")
    .eq("entity_category_id", config.entityCategoryId)
    .eq("entity_ranking_id", ranking.id)
    .lte("created_at", threeDaysAgo)
    .order("created_at", { ascending: false })
    .limit(1)
  if (snapRows?.length) {
    movement = snapRows[0].rank - rankPosition
  }

  const { data: totalVotesInCategory } = await supabase.rpc("get_total_votes", {
    category_input: config.entityCategoryId,
  })

  return {
    props: {
      sport,
      config,
      entity,
      ranking,
      rankPosition,
      totalInCategory,
      winRate,
      movement,
      totalVotesInCategory: totalVotesInCategory || 0,
      topPlayer,
      nearby,
      canonicalUrl: `${config.canonical}/${entity.slug}`,
    },
    revalidate: 300,
  }
}
