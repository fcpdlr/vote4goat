import { useState } from "react"
import { supabase } from "../lib/supabase"
import TriBar from "../components/redesign/TriBar"
import Throne from "../components/redesign/Throne"
import VoteOverlay from "../components/redesign/VoteOverlay"

// Scratch QA page for the redesign components (Fase 3, session 2). Not
// linked from nav or the sitemap — throwaway once the real category/home
// pages exist (Fase 3 sessions 3+).
export default function RedesignPreview({ top3, duelPlayers, initialTally }) {
  const [result, setResult] = useState(null)
  const [deviceHash] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("rd_preview_device") || (() => {
          const id = "preview-" + Math.random().toString(36).slice(2)
          localStorage.setItem("rd_preview_device", id)
          return id
        })())
      : "ssr"
  )

  const handleVote = async (side) => {
    await supabase.rpc("cast_vote", {
      category_slug: "football",
      player_a_id: duelPlayers[0].id,
      player_b_id: duelPlayers[1].id,
      result: side,
      device_hash_input: deviceHash,
      source_input: "stream",
    })
    const tally = await fetchTally()
    setResult(tally)
  }

  const handleCantDecide = async () => {
    await supabase.rpc("cast_vote", {
      category_slug: "football",
      player_a_id: duelPlayers[0].id,
      player_b_id: duelPlayers[1].id,
      result: "cant_decide",
      device_hash_input: deviceHash,
      source_input: "stream",
    })
    const tally = await fetchTally()
    setResult(tally)
  }

  const fetchTally = async () => {
    const [a, b] = duelPlayers
    const { data } = await supabase
      .from("votes")
      .select("result")
      .or(`and(player_a.eq.${a.id},player_b.eq.${b.id}),and(player_a.eq.${b.id},player_b.eq.${a.id})`)
    const rows = data || []
    return {
      votesA: rows.filter((r) => r.result === "a").length,
      votesB: rows.filter((r) => r.result === "b").length,
      votesCantDecide: rows.filter((r) => r.result === "cant_decide").length,
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink font-sans pb-40">
      <div className="max-w-md mx-auto px-4 pt-8">
        <h1 className="text-lg font-black mb-6">Redesign component preview</h1>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-ink/40 mb-2">Throne &mdash; young category (real top 3)</h2>
          <div className="border border-ink/10 rounded-2xl">
            <Throne first={top3[0]} second={top3[1]} third={top3[2]} daysDefended={null} />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-ink/40 mb-2">Throne &mdash; normal (example)</h2>
          <div className="border border-ink/10 rounded-2xl">
            <Throne first={top3[0]} second={top3[1]} third={top3[2]} daysDefended={12} />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-ink/40 mb-2">Throne &mdash; dead heat (example)</h2>
          <div className="border border-ink/10 rounded-2xl">
            <Throne first={top3[0]} second={top3[1]} third={top3[2]} deadHeat />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-ink/40 mb-2">TriBar &mdash; full (real seed tally)</h2>
          <TriBar
            votesA={initialTally.votesA}
            votesB={initialTally.votesB}
            votesCantDecide={initialTally.votesCantDecide}
            labelA={duelPlayers[0].short_name}
            labelB={duelPlayers[1].short_name}
            variant="full"
          />
        </section>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-ink/40 mb-2">TriBar &mdash; slim</h2>
          <TriBar
            votesA={initialTally.votesA}
            votesB={initialTally.votesB}
            votesCantDecide={initialTally.votesCantDecide}
            variant="slim"
          />
        </section>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-ink/40 mb-2">TriBar &mdash; no votes yet</h2>
          <TriBar votesA={0} votesB={0} votesCantDecide={0} labelA="A" labelB="B" variant="full" />
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink/40 mb-2">
            VoteOverlay &mdash; tap a side or &quot;Can&apos;t decide&quot; (live RPC call)
          </h2>
          <p className="text-xs text-ink/40">Scroll down, the sheet is fixed to the bottom.</p>
        </section>
      </div>

      <VoteOverlay
        playerA={duelPlayers[0]}
        playerB={duelPlayers[1]}
        result={result}
        onVote={handleVote}
        onCantDecide={handleCantDecide}
        onDone={() => setResult(null)}
      />
    </main>
  )
}

export async function getServerSideProps() {
  const { data: category } = await supabase.from("categories").select("id").eq("slug", "football").maybeSingle()

  const { data: ranked } = await supabase
    .from("players")
    .select("id, slug, name, short_name, jersey, elo_current")
    .eq("category_id", category.id)
    .order("elo_current", { ascending: false })
    .limit(10)

  const top3 = ranked.slice(0, 3)
  const duelPlayers = [ranked[4], ranked[5]]

  const [a, b] = duelPlayers
  const { data: tallyRows } = await supabase
    .from("votes")
    .select("result")
    .or(`and(player_a.eq.${a.id},player_b.eq.${b.id}),and(player_a.eq.${b.id},player_b.eq.${a.id})`)
  const rows = tallyRows || []

  return {
    props: {
      top3,
      duelPlayers,
      initialTally: {
        votesA: rows.filter((r) => r.result === "a").length,
        votesB: rows.filter((r) => r.result === "b").length,
        votesCantDecide: rows.filter((r) => r.result === "cant_decide").length,
      },
    },
  }
}
