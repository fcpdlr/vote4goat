import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Head from "next/head"
import Header from "../../components/Header"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Rank4IndexPage() {
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("rank4_questions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
      if (error) console.error("Error loading R4NK questions:", error)
      setQuestions(data || [])
      setIsLoading(false)
    }
    fetchQuestions()
  }, [])

  const isOpen = (q) => {
    if (!q.closes_at) return true
    return new Date(q.closes_at) > new Date()
  }

  const daysLeft = (closes_at) => {
    if (!closes_at) return null
    const diff = new Date(closes_at) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days <= 0) return "Closed"
    if (days === 1) return "1 day left"
    return days + " days left"
  }

  return (
    <>
      <Head>
        <title>R4NK - Weekly Rankings | Vote4GOAT</title>
        <meta name="description" content="Order 4 players from best to worst. One question per week. The world's verdict revealed." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://vote4goat.com/rank4" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="R4NK - Weekly Rankings | Vote4GOAT" />
        <meta property="og:description" content="Order 4 players from best to worst. One question per week. The world's verdict revealed." />
        <meta property="og:url" content="https://vote4goat.com/rank4" />
        <meta property="og:image" content="https://vote4goat.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Vote4GOAT" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="R4NK - Weekly Rankings | Vote4GOAT" />
        <meta name="twitter:description" content="Order 4 players from best to worst. One question per week. The world's verdict revealed." />
        <meta name="twitter:image" content="https://vote4goat.com/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">

        <Header />

        <div className="text-center pt-8 pb-2 px-4">
          <p className="text-xs tracking-widest uppercase text-white/30 mb-2">R4NK Mode</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Rank <span className="text-goat">4</span> players
          </h1>
          <p className="text-sm text-white/40 max-w-xs mx-auto">Order them 1 to 4. See how the world votes. New debate every week.</p>
        </div>

        <div className="w-full max-w-lg mx-auto flex flex-col gap-4 mt-6 pb-10 px-1">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-white/30">No active R4NKs right now.</p>
              <p className="text-xs text-white/20 mt-1">Check back soon.</p>
            </div>
          ) : (
            questions.map(q => {
              const open = isOpen(q)
              const dl = daysLeft(q.closes_at)
              return (
                <a
                  key={q.id}
                  href={open ? "/rank4/" + q.id : "/rank4/" + q.id + "/results"}
                  className={"block border rounded-2xl p-5 transition " + (open ? "bg-white/[0.04] border-white/10 hover:border-goat/40 hover:bg-white/[0.07]" : "bg-white/[0.02] border-white/[0.06] opacity-60")}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      {q.sport && <p className="text-[10px] uppercase tracking-widest text-goat/70 mb-1">{q.sport}</p>}
                      <h2 className="text-base font-bold text-white leading-snug">{q.title}</h2>
                      {q.description && <p className="text-xs text-white/35 mt-1 line-clamp-2">{q.description}</p>}
                    </div>
                    <div className={"flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold " + (open ? "bg-green-900/40 text-green-400 border border-green-800/40" : "bg-white/5 text-white/25 border border-white/8")}>
                      {dl || (open ? "Open" : "Closed")}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[q.option_1, q.option_2, q.option_3, q.option_4].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2.5 border border-white/[0.06]">
                        <span className="text-goat text-xs font-black w-4 flex-shrink-0">{i + 1}</span>
                        <span className="text-sm text-white/65 truncate">{opt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <span className="text-xs font-semibold text-goat">
                      {open ? "Vote now" : "See results"} &#x2192;
                    </span>
                  </div>
                </a>
              )
            })
          )}
        </div>

      </main>
    </>
  )
}
