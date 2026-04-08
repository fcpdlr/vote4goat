import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"
import Header from "../../../components/Header"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Rank4ResultsPage() {
  const router = useRouter()
  const { id } = router.query

  const [question, setQuestion] = useState(null)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      setIsLoading(true)

      const { data: q, error: qError } = await supabase
        .from("rank4_questions")
        .select("*")
        .eq("id", id)
        .single()
      if (qError) { setError("Question not found."); setIsLoading(false); return }
      setQuestion(q)

      const { data: r, error: rError } = await supabase
        .from("rank4_results")
        .select("*")
        .eq("question_id", id)
        .order("points", { ascending: false })
      if (rError) { setError("Error loading results."); setIsLoading(false); return }
      setResults(r || [])
      setIsLoading(false)
    }
    fetchData()
  }, [id])

  const isOpen = (q) => {
    if (!q?.closes_at) return true
    return new Date(q.closes_at) > new Date()
  }

  const getSlotStyle = (index) => {
    if (index === 0) return { backgroundColor: "#f5d06f" }
    if (index === 1) return { backgroundColor: "#d8d8dd" }
    if (index === 2) return { backgroundColor: "#d9a673" }
    return { backgroundColor: "#1f2937" }
  }

  const getTextColor = (index) => index < 3 ? "#000" : "#fff"

  const totalVotes = results.length > 0 ? results[0].votes_count : 0
  const topPoints = results.length > 0 ? results[0].points : 1

  const shareText = question
    ? "The world has ranked: " + results.map((r, i) => (i + 1) + ". " + r.option_text).join(", ") + " - vote4goat.com/rank4/" + id + "/results"
    : ""

  return (
    <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">

      <Header />

      {isLoading ? (
        <p className="text-sm text-white/40 text-center mt-20">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-400 text-center mt-20">{error}</p>
      ) : question ? (
        <div className="flex-1 mt-4 mb-8">
          <div className="max-w-lg mx-auto px-1">

            <button onClick={() => router.push("/rank4")} className="text-xs text-white/40 hover:text-white/70 underline mb-4 transition">
              &#x2190; Back to R4NKs
            </button>

            <div className="text-center mb-6">
              {question.sport && <div className="text-xs uppercase tracking-widest text-goat mb-1">{question.sport}</div>}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{question.title}</h1>
              {question.description && (
                <p className="text-xs text-white/40 max-w-sm mx-auto mb-2">{question.description}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-2">
                {isOpen(question) ? (
                  <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded-full">
                    Still open &#x2014; vote now
                  </span>
                ) : (
                  <span className="text-xs bg-white/5 text-white/30 px-2 py-1 rounded-full">Closed</span>
                )}
                {totalVotes > 0 && (
                  <span className="text-xs text-white/30">{totalVotes.toLocaleString()} votes</span>
                )}
              </div>
            </div>

            {results.length === 0 ? (
              <p className="text-sm text-white/40 text-center">No votes yet.</p>
            ) : (
              <div className="flex flex-col gap-2 mb-6">
                {results.map((r, i) => {
                  const barPct = Math.round((r.points / topPoints) * 100)
                  return (
                    <div
                      key={r.option_text}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={getSlotStyle(i)}
                    >
                      <span className="text-sm font-bold w-5 text-center shrink-0" style={{ color: getTextColor(i) }}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-semibold truncate" style={{ color: getTextColor(i) }}>
                        {r.option_text}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 rounded-full bg-black/20 overflow-hidden">
                          <div className="h-full rounded-full bg-black/30" style={{ width: barPct + "%" }} />
                        </div>
                        <span className="text-xs font-medium w-12 text-right" style={{ color: getTextColor(i), opacity: 0.6 }}>
                          {Math.round(r.points)} pts
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <a
                href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl text-sm font-bold text-center bg-black border border-white/10 hover:bg-white/5 transition flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share on X
              </a>
              {isOpen(question) && (
                <a
                  href={"/rank4/" + id}
                  className="w-full py-3 rounded-xl text-sm font-bold text-center bg-goat text-black hover:brightness-110 transition"
                >
                  Vote now &#x2192;
                </a>
              )}
            </div>

          </div>
        </div>
      ) : null}
    </main>
  )
}
