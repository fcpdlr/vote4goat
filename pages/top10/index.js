import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import Head from "next/head"
import Header from "../components/Header"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const classifyCategory = (slug) => {
  if (!slug) return "other"
  const s = slug.toLowerCase()
  if (s.includes("real-madrid") || s.includes("fc-barcelona") || s.includes("barcelona-all-time") || s.includes("bayern") || s.includes("manchester-united") || s.includes("liverpool") || s.includes("ac-milan") || s.includes("milan-all-time") || s.includes("boca") || s.includes("river")) return "club"
  if (s.startsWith("brazil-") || s.startsWith("argentina-") || s.startsWith("france-") || s.startsWith("germany-") || s.startsWith("spain-") || s.startsWith("italy-") || s.startsWith("england-")) return "country"
  return "position"
}

const getCategoryTheme = (slug) => {
  if (!slug) return { bar: "#f5a623", tint: "rgba(245,166,35,0.06)" }
  const s = slug.toLowerCase()
  if (s.includes("real-madrid"))          return { bar: "#e8e0c8", tint: "rgba(232,224,200,0.06)" }
  if (s.includes("fc-barcelona") || s.includes("barcelona-all-time")) return { bar: "#a50044", tint: "rgba(165,0,68,0.10)" }
  if (s.includes("bayern"))               return { bar: "#dc052d", tint: "rgba(220,5,45,0.10)" }
  if (s.includes("manchester-united"))    return { bar: "#da291c", tint: "rgba(218,41,28,0.10)" }
  if (s.includes("liverpool"))            return { bar: "#c8102e", tint: "rgba(200,16,46,0.10)" }
  if (s.includes("ac-milan") || s.includes("milan-all-time")) return { bar: "#a0001e", tint: "rgba(160,0,30,0.10)" }
  if (s.includes("boca"))                 return { bar: "#ffcc00", tint: "rgba(255,204,0,0.07)" }
  if (s.includes("river"))                return { bar: "#e11d48", tint: "rgba(225,29,72,0.08)" }
  if (s.startsWith("brazil-"))            return { bar: "#009c3b", tint: "rgba(0,156,59,0.08)" }
  if (s.startsWith("argentina-"))         return { bar: "#75aadb", tint: "rgba(117,170,219,0.08)" }
  if (s.startsWith("france-"))            return { bar: "#0055a4", tint: "rgba(0,85,164,0.10)" }
  if (s.startsWith("germany-"))           return { bar: "#e5e7eb", tint: "rgba(229,231,235,0.05)" }
  if (s.startsWith("spain-"))             return { bar: "#aa151b", tint: "rgba(170,21,27,0.10)" }
  if (s.startsWith("italy-"))             return { bar: "#0072ce", tint: "rgba(0,114,206,0.10)" }
  if (s.startsWith("england-"))           return { bar: "#c8102e", tint: "rgba(200,16,46,0.08)" }
  return { bar: "#f5a623", tint: "rgba(245,166,35,0.06)" }
}

const TABS = ["All", "Clubs", "Countries", "Positions"]

export default function Top10IndexPage() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("All")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("top10_categories")
        .select("id, slug, title, description, entity_category_id, is_active")
        .eq("is_active", true)
        .order("title", { ascending: true })
      if (error) { setError("Error loading categories."); setIsLoading(false); return }
      setCategories(data || [])
      setIsLoading(false)
    }
    fetchCategories()
  }, [])

  const grouped = categories.reduce((acc, cat) => {
    const type = classifyCategory(cat.slug)
    if (type === "club") acc.clubs.push(cat)
    else if (type === "country") acc.countries.push(cat)
    else acc.positions.push(cat)
    return acc
  }, { clubs: [], countries: [], positions: [] })

  const counts = {
    All: categories.length,
    Clubs: grouped.clubs.length,
    Countries: grouped.countries.length,
    Positions: grouped.positions.length,
  }

  const getVisible = () => {
    let items = []
    if (activeTab === "All") items = categories
    else if (activeTab === "Clubs") items = grouped.clubs
    else if (activeTab === "Countries") items = grouped.countries
    else items = grouped.positions
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(c => c.title.toLowerCase().includes(q))
    }
    return items
  }

  const visible = getVisible()

  const CategoryCard = ({ cat }) => {
    const theme = getCategoryTheme(cat.slug)
    return (
      <a
        href={"/top10/" + cat.id}
        className="group flex items-center justify-between h-[68px] border border-white/10 hover:border-white/25 rounded-2xl px-5 transition relative overflow-hidden"
        style={{ background: theme.tint }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: theme.tint }} />
        <div className="flex flex-col gap-0.5 z-10">
          <span className="text-[15px] font-extrabold text-white leading-tight">{cat.title}</span>
          {(() => {
            const s = cat.slug ? cat.slug.toLowerCase() : ""
            const names = s.includes("real-madrid") ? "Ronaldo, Di Stéfano, Zidane, Raúl"
              : (s.includes("fc-barcelona") || s.includes("barcelona-all-time")) ? "Messi, Xavi, Iniesta, Ronaldinho"
              : s.includes("bayern") ? "Müller, Beckenbauer, Ribéry, Lewandowski"
              : s.includes("manchester-united") ? "Giggs, Cantona, Scholes, Ronaldo"
              : s.includes("liverpool") ? "Gerrard, Dalglish, Rush, Salah"
              : (s.includes("ac-milan") || s.includes("milan-all-time")) ? "Maldini, Van Basten, Kaká, Baresi"
              : s.includes("brazil") ? "Pelé, Ronaldo, Ronaldinho, Zico"
              : s.includes("argentina") ? "Messi, Maradona, Di María, Riquelme"
              : s.includes("france") ? "Zidane, Platini, Henry, Mbappé"
              : s.includes("germany") ? "Beckenbauer, Müller, Klose, Lahm"
              : s.includes("spain") ? "Xavi, Iniesta, Ramos, Villa"
              : s.includes("italy") ? "Maldini, Del Piero, Totti, Buffon"
              : s.includes("england") ? "Beckham, Lineker, Shearer, Charlton"
              : null
            if (!names) return null
            return <span className="text-[10px] text-white/35 font-medium truncate">{names}</span>
          })()}
        </div>
        <svg className="w-4 h-4 text-white/20 group-hover:text-white/60 transition z-10 flex-shrink-0 ml-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: theme.bar }} />
      </a>
    )
  }

  const renderSection = (label, items) => {
    if (items.length === 0) return null
    return (
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3 px-1">{label}</p>
        <div className="flex flex-col gap-2">
          {items.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (search.trim() || activeTab !== "All") {
      return (
        <div className="flex flex-col gap-2 pb-10">
          {visible.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
        </div>
      )
    }
    return (
      <div className="pb-10">
        {renderSection("Clubs", grouped.clubs)}
        {renderSection("Countries", grouped.countries)}
        {renderSection("Positions", grouped.positions)}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Build your Top 10 | Vote4GOAT</title>
        <meta name="description" content="Build your all-time Top 10 by club or national team and see how it compares with the world." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://vote4goat.com/top10" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Build your Top 10 | Vote4GOAT" />
        <meta property="og:description" content="Build your all-time Top 10 by club or national team and see how it compares with the world." />
        <meta property="og:url" content="https://vote4goat.com/top10" />
        <meta property="og:image" content="https://vote4goat.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Vote4GOAT" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Build your Top 10 | Vote4GOAT" />
        <meta name="twitter:description" content="Build your all-time Top 10 by club or national team and see how it compares with the world." />
        <meta name="twitter:image" content="https://vote4goat.com/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">

        <Header />

        <div className="text-center pt-8 pb-4 px-4">
          <p className="text-xs tracking-widest uppercase text-white/30 mb-2">T0PS Mode</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
            Build your <span className="text-goat">Top 10</span>
          </h1>
          <p className="text-sm text-white/40 max-w-xs mx-auto">Pick a category. Rank your 10. Compare with the world.</p>
        </div>

        <div className="max-w-lg mx-auto w-full px-1 mt-2">

          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">&#x1F50D;</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clubs, countries..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-goat/40 transition"
            />
          </div>

          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={"flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border transition " + (activeTab === tab ? "bg-goat/10 border-goat/30 text-goat" : "bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60")}
              >
                {tab}
                {counts[tab] > 0 && <span className="ml-1 opacity-50">{counts[tab]}</span>}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-sm text-white/30 text-center py-8">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-400 text-center py-8">{error}</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">No results.</p>
          ) : (
            renderContent()
          )}

        </div>
      </main>
    </>
  )
}
