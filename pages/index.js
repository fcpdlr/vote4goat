import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import Meta from "../components/Meta"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function Home() {
  const [ranking, setRanking] = useState([])
  const [activeRank4, setActiveRank4] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadingPodium, setLoadingPodium] = useState(true)

  useEffect(() => {
    supabase
      .from("entity_rankings")
      .select("id, elo_rating, entities (name, image_url)")
      .eq("entity_category_id", 1)
      .order("elo_rating", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setRanking(data || [])
        setLoadingPodium(false)
      })

    supabase
      .from("rank4_questions")
      .select("id, title, option_1, option_2, option_3, option_4")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setActiveRank4(data) })

    supabase
      .from("top10_categories")
      .select("id, title")
      .eq("is_active", true)
      .limit(6)
      .then(({ data }) => setCategories(data || []))
  }, [])

  const [p1, p2, p3] = ranking

  return (
    <>
      <Meta />

      <main className="min-h-screen bg-background text-white font-sans flex flex-col">

        <Header />

        {/* HERO — compact, solo título */}
        <div className="relative px-4 pt-10 pb-2 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[220px] rounded-full bg-goat/[0.07] blur-3xl" />
          </div>
          <p className="relative text-[10px] tracking-[0.3em] uppercase text-white/20 mb-3 font-medium">
            Football · All time
          </p>
          <h1 className="relative leading-[0.88]">
            <span className="block font-black text-white uppercase"
              style={{ fontSize: "clamp(44px, 12vw, 68px)", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.02em" }}>
              WHO IS
            </span>
            <span className="block font-black text-goat uppercase"
              style={{ fontSize: "clamp(56px, 16vw, 90px)", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.02em" }}>
              THE GOAT?
            </span>
          </h1>
        </div>

        {/* PODIO — top 3 visible sin scroll */}
        <div className="px-4 pt-6 pb-4 max-w-sm mx-auto w-full">
          {loadingPodium ? (
            <div className="flex items-end justify-center gap-4 h-28">
              <div className="w-16 h-16 rounded-full bg-white/[0.06] animate-pulse self-center" />
              <div className="w-20 h-20 rounded-full bg-white/[0.06] animate-pulse self-start" />
              <div className="w-16 h-16 rounded-full bg-white/[0.06] animate-pulse self-center" />
            </div>
          ) : (
            <div className="flex items-end justify-center gap-2">

              {/* #2 — izquierda */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                {p2 ? (
                  <>
                    <img
                      src={p2.entities.image_url}
                      alt={p2.entities.name}
                      className="w-16 h-16 rounded-full object-cover object-top border-2 border-white/15"
                      loading="lazy"
                    />
                    <span className="text-[10px] text-white/35 font-semibold">🥈</span>
                    <span className="text-[11px] text-white/55 text-center font-medium leading-tight line-clamp-2 w-full">{p2.entities.name}</span>
                  </>
                ) : <div className="flex-1" />}
              </div>

              {/* #1 — centro, más grande, elevado */}
              <div className="flex flex-col items-center gap-1.5 flex-1 -translate-y-5">
                {p1 ? (
                  <>
                    <div className="relative">
                      <img
                        src={p1.entities.image_url}
                        alt={p1.entities.name}
                        className="w-[84px] h-[84px] rounded-full object-cover object-top border-2 border-goat shadow-[0_0_24px_rgba(245,166,35,0.3)]"
                        loading="lazy"
                      />
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base leading-none">🥇</span>
                    </div>
                    <span className="text-goat text-[10px] font-bold uppercase tracking-wide">#1</span>
                    <span className="text-[11px] text-white font-bold text-center leading-tight line-clamp-2 w-full">{p1.entities.name}</span>
                  </>
                ) : null}
              </div>

              {/* #3 — derecha */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                {p3 ? (
                  <>
                    <img
                      src={p3.entities.image_url}
                      alt={p3.entities.name}
                      className="w-16 h-16 rounded-full object-cover object-top border-2 border-white/15"
                      loading="lazy"
                    />
                    <span className="text-[10px] text-white/35 font-semibold">🥉</span>
                    <span className="text-[11px] text-white/55 text-center font-medium leading-tight line-clamp-2 w-full">{p3.entities.name}</span>
                  </>
                ) : <div className="flex-1" />}
              </div>

            </div>
          )}

          {/* Live indicator + CTA principal */}
          <div className="mt-5 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-white/25 uppercase tracking-widest">Live ranking</span>
            </div>
            <a
              href="/football"
              className="bg-goat text-black px-8 py-3 rounded-full text-sm font-black tracking-wide hover:brightness-110 transition w-full text-center"
            >
              Vote now →
            </a>
            <a href="/football" className="text-xs text-white/25 hover:text-white/50 transition">
              See full ranking
            </a>
          </div>
        </div>

        {/* SEPARADOR */}
        <div className="px-4 max-w-lg mx-auto w-full">
          <div className="border-t border-white/5" />
        </div>

        {/* CARDS SECUNDARIAS */}
        <div className="px-4 py-6 max-w-lg mx-auto w-full flex flex-col gap-4 flex-1">

          {/* T0PS */}
          <a href="/top10" className="block bg-white/[0.03] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black tracking-wider" style={{ fontFamily: "system-ui, sans-serif" }}>
                <span className="text-white">T</span>
                <span className="text-goat">1</span>
                <span className="text-goat">0</span>
                <span className="text-white">PS</span>
              </span>
              <span className="text-[10px] text-white/25 uppercase tracking-widest">Top 10</span>
            </div>
            <p className="text-xs text-white/40 mb-3 leading-relaxed">
              Build your all-time Top 10. Compare it with the world.
            </p>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {categories.slice(0, 5).map(cat => (
                  <span key={cat.id} className="text-[10px] bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-full">
                    {cat.title}
                  </span>
                ))}
                <span className="text-[10px] bg-goat/10 border border-goat/20 text-goat/70 px-2.5 py-1 rounded-full">
                  Browse all →
                </span>
              </div>
            ) : (
              <span className="text-xs text-goat/60 font-medium">Browse categories →</span>
            )}
          </a>

          {/* R4NK */}
          {activeRank4 && (
            <a
              href={"/rank4/" + activeRank4.id}
              className="block bg-white/[0.03] border border-white/8 rounded-2xl p-5 hover:border-goat/20 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black tracking-wider" style={{ fontFamily: "system-ui, sans-serif" }}>
                  <span className="text-white">R</span>
                  <span className="text-goat">4</span>
                  <span className="text-white">NK</span>
                </span>
                <span className="text-[10px] bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                  This week
                </span>
              </div>
              <p className="text-sm font-semibold text-white mb-3 leading-snug">{activeRank4.title}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[activeRank4.option_1, activeRank4.option_2, activeRank4.option_3, activeRank4.option_4].map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-1.5">
                    <span className="text-goat text-[10px] font-bold shrink-0">{i + 1}</span>
                    <span className="text-[10px] text-white/50 truncate">{opt}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-goat mt-3 text-right font-semibold">Rank them →</p>
            </a>
          )}

        </div>

        <Footer />
      </main>
    </>
  )
}
