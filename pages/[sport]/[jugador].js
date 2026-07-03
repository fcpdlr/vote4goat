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

          <p className="text-sm text-white/60 leading-relaxed mb-8">{answer}</p>

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
  const prevPlayer = index > 0 ? categoryList[index - 1].entities : null
  const nextPlayer = index < categoryList.length - 1 ? categoryList[index + 1].entities : null

  const totalDuels = ranking.wins + ranking.losses
  const winRate = totalDuels > 0 ? Math.round((ranking.wins / totalDuels) * 1000) / 10 : null

  return {
    props: {
      sport,
      config,
      entity,
      ranking,
      rankPosition,
      totalInCategory,
      winRate,
      totalDuels,
      prevPlayer,
      nextPlayer,
      canonicalUrl: `${config.canonical}/${entity.slug}`,
    },
    revalidate: 300,
  }
}
