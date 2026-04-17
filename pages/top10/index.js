import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Head from "next/head"
import Header from "../../components/Header"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const classifyCategory = (slug) => {
  if (!slug) return "other"
  const s = slug.toLowerCase()
  if (["goat", "coaches-all-time", "clubs-all-time", "teams-all-time"].includes(s)) return "theme"
  if (s.includes("real-madrid") || s.includes("fc-barcelona") || s.includes("barcelona-all-time") || s.includes("bayern") || s.includes("manchester-united") || s.includes("liverpool") || s.includes("ac-milan") || s.includes("milan-all-time") || s.includes("boca") || s.includes("river")) return "club"
  if (s.startsWith("brazil-") || s.startsWith("argentina-") || s.startsWith("france-") || s.startsWith("germany-") || s.startsWith("spain-") || s.startsWith("italy-") || s.startsWith("england-")) return "country"
  return "position"
}

const getCategoryTheme = (slug) => {
  if (!slug) return { bar: "#f5a623", tint: "rgba(245,166,35,0.06)", glow: "#f5a623", label: "#f5a623", bg: "#131310" }
  const s = slug.toLowerCase()
  if (s === "goat")                     return { bar: "#f5a623", tint: "rgba(245,166,35,0.08)", glow: "#f5a623", label: "#f5a623", bg: "#131310" }
  if (s.includes("real-madrid"))        return { bar: "#e8e0c8", tint: "rgba(200,180,122,0.07)", glow: "#c8b47a", label: "#c8b47a", bg: "#14120a" }
  if (s.includes("fc-barcelona") || s.includes("barcelona-all-time")) return { bar: "#a50044", barEnd: "#004d98", tint: "rgba(0,77,152,0.1)", glow: "#004d98", label: "#6496e8", bg: "#0a1118" }
  if (s.includes("bayern"))             return { bar: "#dc052d", tint: "rgba(220,5,45,0.1)", glow: "#dc052d", label: "#f04060", bg: "#160808" }
  if (s.includes("manchester-united"))  return { bar: "#da291c", barEnd: "#fbe122", tint: "rgba(218,41,28,0.1)", glow: "#da291c", label: "#e84040", bg: "#100808" }
  if (s.includes("liverpool"))          return { bar: "#c8102e", barEnd: "#e8c600", tint: "rgba(200,16,46,0.1)", glow: "#c8102e", label: "#e84060", bg: "#100808" }
  if (s.includes("ac-milan") || s.includes("milan-all-time")) return { bar: "#a0001e", tint: "rgba(160,0,30,0.1)", glow: "#a0001e", label: "#e84060", bg: "#100808" }
  if (s.includes("boca"))               return { bar: "#ffcc00", tint: "rgba(0,51,160,0.12)", glow: "#0033a0", label: "#6496e8", bg: "#080e1c" }
  if (s.includes("river"))              return { bar: "#e11d48", tint: "rgba(225,29,72,0.08)", glow: "#e11d48", label: "#e84060", bg: "#160a0e" }
  if (s.startsWith("brazil-"))          return { bar: "#009c3b", barEnd: "#ffdf00", tint: "rgba(0,156,59,0.1)", glow: "#009c3b", label: "#00c44b", bg: "#0a1f10" }
  if (s.startsWith("argentina-"))       return { bar: "#74acdf", tint: "rgba(116,172,223,0.1)", glow: "#74acdf", label: "#74acdf", bg: "#0d1b2a" }
  if (s.startsWith("france-"))          return { bar: "#002395", barEnd: "#e31837", tint: "rgba(0,35,149,0.12)", glow: "#002395", label: "#4a7fe8", bg: "#080c1c" }
  if (s.startsWith("germany-"))         return { bar: "#dd0000", barEnd: "#ffce00", tint: "rgba(221,0,0,0.08)", glow: "#dd0000", label: "#e84040", bg: "#100808" }
  if (s.startsWith("spain-"))           return { bar: "#aa151b", barEnd: "#f1bf00", tint: "rgba(170,21,27,0.1)", glow: "#aa151b", label: "#e84040", bg: "#160808" }
  if (s.startsWith("italy-"))           return { bar: "#009246", barEnd: "#ce2b37", tint: "rgba(0,114,206,0.1)", glow: "#0072ce", label: "#4a9ef5", bg: "#080e1a" }
  if (s.startsWith("england-"))         return { bar: "#fff", barEnd: "#c8102e", tint: "rgba(200,16,46,0.08)", glow: "#c8102e", label: "#e84060", bg: "#160a0e" }
  return { bar: "#f5a623", tint: "rgba(245,166,35,0.06)", glow: "#f5a623", label: "#f5a623", bg: "#131310" }
}

const GOAT_SUBTITLES = {
  "goat": "Messi · Ronaldo · Maradona · Pelé",
  "coaches-all-time": "Guardiola · Ferguson · Cruyff · Mourinho",
  "clubs-all-time": "Real Madrid · Barcelona · Bayern · United",
  "teams-all-time": "Spain 2010 · Brazil 1970 · France 1998",
  "real-madrid": "Ronaldo · Di Stéfano · Zidane · Raúl",
  "fc-barcelona": "Messi · Xavi · Iniesta · Ronaldinho",
  "barcelona-all-time": "Messi · Xavi · Iniesta · Ronaldinho",
  "bayern": "Müller · Beckenbauer · Ribéry · Lewandowski",
  "manchester-united": "Giggs · Cantona · Scholes · Ronaldo",
  "liverpool": "Gerrard · Dalglish · Rush · Salah",
  "ac-milan": "Maldini · Van Basten · Kaká · Baresi",
  "brazil": "Pelé · Ronaldo · Ronaldinho · Zico",
  "argentina": "Messi · Maradona · Di María · Riquelme",
  "france": "Zidane · Platini · Henry · Mbappé",
  "germany": "Beckenbauer · Müller · Klose · Lahm",
  "spain": "Xavi · Iniesta · Ramos · Villa",
  "italy": "Maldini · Del Piero · Totti · Buffon",
  "england": "Beckham · Lineker · Shearer · Charlton",
}

const getSubtitle = (slug) => {
  if (!slug) return null
  const s = slug.toLowerCase()
  for (const [key, val] of Object.entries(GOAT_SUBTITLES)) {
    if (s.includes(key)) return val
  }
  return null
}

const POSITION_ICONS = {
  "striker": (color) => (
    <svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke={color} strokeWidth="1.2">
      <circle cx="22" cy="22" r="14"/>
      <path d="M15 15 L22 8 L29 15"/>
      <path d="M15 29 L22 36 L29 29"/>
      <circle cx="22" cy="22" r="5"/>
      <path d="M14 18 Q8 22 14 26"/>
      <path d="M30 18 Q36 22 30 26"/>
    </svg>
  ),
  "goalkeeper": (color) => (
    <svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke={color} strokeWidth="1.2">
      <rect x="10" y="14" width="24" height="18" rx="2"/>
      <line x1="10" y1="22" x2="34" y2="22"/>
      <line x1="22" y1="14" x2="22" y2="32"/>
      <circle cx="22" cy="9" r="3"/>
    </svg>
  ),
  "defender": (color) => (
    <svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke={color} strokeWidth="1.2">
      <path d="M22 6 L34 12 L34 24 Q34 34 22 40 Q10 34 10 24 L10 12 Z"/>
    </svg>
  ),
  "midfielder": (color) => (
    <svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke={color} strokeWidth="1.2">
      <circle cx="22" cy="22" r="14"/>
      <path d="M13 17 Q22 22 31 17"/>
      <path d="M13 27 Q22 22 31 27"/>
      <line x1="22" y1="8" x2="22" y2="36"/>
    </svg>
  ),
}

const ShieldIcon = ({ color }) => (
  <svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke={color} strokeWidth="1.2">
    <path d="M22 4 L36 10 L36 22 Q36 32 22 40 Q8 32 8 22 L8 10 Z"/>
    <line x1="22" y1="10" x2="22" y2="36"/>
    <line x1="10" y1="21" x2="34" y2="21"/>
  </svg>
)

const GlobeIcon = ({ color }) => (
  <svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke={color} strokeWidth="1.2">
    <circle cx="22" cy="22" r="16"/>
    <ellipse cx="22" cy="22" rx="7" ry="16"/>
    <line x1="6" y1="22" x2="38" y2="22"/>
    <path d="M9 15 Q22 19 35 15"/>
    <path d="M9 29 Q22 25 35 29"/>
  </svg>
)

const ThemeIcon = ({ color }) => (
  <svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke={color} strokeWidth="1.2">
    <polygon points="22,4 28,14 40,16 31,25 33,37 22,31 11,37 13,25 4,16 16,14"/>
  </svg>
)

const getPositionIcon = (slug) => {
  if (!slug) return null
  const s = slug.toLowerCase()
  if (s.includes("striker") || s.includes("forward")) return "striker"
  if (s.includes("goalkeeper") || s.includes("keeper")) return "goalkeeper"
  if (s.includes("defender") || s.includes("defence")) return "defender"
  if (s.includes("midfielder") || s.includes("midfield")) return "midfielder"
  return null
}

const TABS = ["All", "Clubs", "Countries", "Positions", "Themes"]

const FeaturedCard = ({ cat }) => {
  const theme = getCategoryTheme(cat.slug)
  const subtitle = getSubtitle(cat.slug)
  return (
    <a
      href={`/top10/${cat.id}`}
      className="group relative flex items-center gap-4 rounded-[18px] border border-white/8 overflow-hidden transition-all duration-200 hover:scale-[1.015] hover:border-white/16"
      style={{ background: "#13191f", padding: "18px 20px" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 15% 50%, ${theme.glow}30, transparent 55%)` }} />
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: theme.barEnd ? `linear-gradient(to right, ${theme.bar}, ${theme.barEnd}, transparent)` : `linear-gradient(to right, ${theme.bar}, transparent)` }} />
      <div className="relative z-10 w-[46px] h-[46px] rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: `${theme.glow}20` }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={theme.label} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div className="relative z-10">
        <p className="text-[9px] font-bold tracking-[0.13em] uppercase mb-1" style={{ color: theme.label }}>Featured</p>
        <p className="text-[17px] font-black text-white leading-tight mb-[3px]">{cat.title}</p>
        {subtitle && <p className="text-[11px] text-white/32">{subtitle}</p>}
      </div>
    </a>
  )
}

const CategoryCard = ({ cat }) => {
  const theme = getCategoryTheme(cat.slug)
  const type = classifyCategory(cat.slug)
  const subtitle = getSubtitle(cat.slug)
  const positionKey = type === "position" ? getPositionIcon(cat.slug) : null

  const Icon = () => {
    if (type === "country") return <GlobeIcon color={theme.label} />
    if (type === "club") return <ShieldIcon color={theme.label} />
    if (type === "position" && positionKey) return POSITION_ICONS[positionKey](theme.label)
    return <ThemeIcon color={theme.label} />
  }

  return (
    <a
      href={`/top10/${cat.id}`}
      className="group relative flex flex-col justify-end rounded-2xl border border-white/8 overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:border-white/18"
      style={{ aspectRatio: "1", padding: "13px", background: theme.bg || "#13191f" }}
    >
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-200" style={{ background: `radial-gradient(circle at 20% 20%, ${theme.glow}28, transparent 65%)`, opacity: 0.14 }} />
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: theme.barEnd ? `linear-gradient(to right, ${theme.bar}, ${theme.barEnd})` : theme.bar }} />
      <div className="absolute top-[11px] right-[11px] opacity-[0.14]"><Icon /></div>
      <div className="relative z-10">
        <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-1" style={{ color: theme.label }}>{type === "theme" ? "Theme" : type.charAt(0).toUpperCase() + type.slice(1)}</p>
        <p className="text-[15px] font-black text-white leading-tight mb-[3px]">{cat.title.replace(" All-Time", "")}</p>
        {subtitle && <p className="text-[10px] leading-[1.4]" style={{ color: "rgba(255,255,255,0.32)" }}>{subtitle.split(" · ").slice(0, 3).join(" · ")}</p>}
      </div>
    </a>
  )
}

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 mb-[10px] mt-[22px]">
    <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.22)" }}>{children}</span>
    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
  </div>
)

const Grid = ({ children }) => (
  <div className="grid grid-cols-2 gap-[10px]">{children}</div>
)

const TABS_LIST = ["All", "Clubs", "Countries", "Positions", "Themes"]

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
    if (type === "theme") acc.themes.push(cat)
    else if (type === "club") acc.clubs.push(cat)
    else if (type === "country") acc.countries.push(cat)
    else acc.positions.push(cat)
    return acc
  }, { themes: [], clubs: [], countries: [], positions: [] })

  const featured = categories.filter(c => c.slug?.toLowerCase() === "goat")

  const counts = {
    All: categories.length,
    Clubs: grouped.clubs.length,
    Countries: grouped.countries.length,
    Positions: grouped.positions.length,
    Themes: grouped.themes.length,
  }

  const getVisible = () => {
    let items = []
    if (activeTab === "All") items = categories
    else if (activeTab === "Clubs") items = grouped.clubs
    else if (activeTab === "Countries") items = grouped.countries
    else if (activeTab === "Positions") items = grouped.positions
    else items = grouped.themes
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(c => c.title.toLowerCase().includes(q))
    }
    return items.filter(c => c.slug?.toLowerCase() !== "goat")
  }

  const visible = getVisible()
  const isFiltered = search.trim() || activeTab !== "All"

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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://vote4goat.com/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-background text-white font-sans flex flex-col pb-12">
        <Header />

        <div className="max-w-lg mx-auto w-full px-4">

          {/* HERO */}
          <div className="text-center pt-5 pb-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-[6px]" style={{ color: "rgba(255,255,255,0.22)" }}>T0PS Mode</p>
            <h1 className="text-[24px] font-black leading-tight mb-[5px]">
              Build your <span className="text-goat">Top 10</span>
            </h1>
            <p className="text-[12px] max-w-[260px] mx-auto leading-[1.5]" style={{ color: "rgba(255,255,255,0.32)" }}>
              Pick a category. Rank your 10. Compare with the world.
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative mb-3">
            <svg className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] pointer-events-none" style={{ opacity: 0.28 }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clubs, countries, positions..."
              className="w-full rounded-[14px] pl-[36px] pr-4 py-[11px] text-[13px] text-white transition-all duration-150 outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>

          {/* TABS */}
          <div className="flex gap-[5px] mb-5 overflow-x-auto pb-[2px]" style={{ scrollbarWidth: "none" }}>
            {TABS_LIST.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-shrink-0 rounded-full text-[11px] font-bold border transition-all duration-150"
                style={{
                  padding: "5px 12px",
                  background: activeTab === tab ? "rgba(245,166,35,0.14)" : "rgba(255,255,255,0.04)",
                  borderColor: activeTab === tab ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.1)",
                  color: activeTab === tab ? "#f5a623" : "rgba(255,255,255,0.38)",
                }}
              >
                {tab}
                {counts[tab] > 0 && <span style={{ opacity: 0.42, marginLeft: 3 }}>{counts[tab]}</span>}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-[13px] text-center py-10" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</p>
          ) : error ? (
            <p className="text-[13px] text-center py-10 text-red-400">{error}</p>
          ) : isFiltered ? (
            <Grid>
              {visible.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
            </Grid>
          ) : (
            <>
              {featured.length > 0 && (
                <>
                  <SectionLabel>Featured</SectionLabel>
                  <div className="flex flex-col gap-2 mb-1">
                    {featured.map(cat => <FeaturedCard key={cat.id} cat={cat} />)}
                  </div>
                </>
              )}

              {grouped.clubs.length > 0 && (
                <>
                  <SectionLabel>Clubs</SectionLabel>
                  <Grid>{grouped.clubs.map(cat => <CategoryCard key={cat.id} cat={cat} />)}</Grid>
                </>
              )}

              {grouped.countries.length > 0 && (
                <>
                  <SectionLabel>Countries</SectionLabel>
                  <Grid>{grouped.countries.map(cat => <CategoryCard key={cat.id} cat={cat} />)}</Grid>
                </>
              )}

              {grouped.positions.length > 0 && (
                <>
                  <SectionLabel>Positions</SectionLabel>
                  <Grid>{grouped.positions.map(cat => <CategoryCard key={cat.id} cat={cat} />)}</Grid>
                </>
              )}

              {grouped.themes.length > 0 && (
                <>
                  <SectionLabel>Themes</SectionLabel>
                  <Grid>{grouped.themes.map(cat => <CategoryCard key={cat.id} cat={cat} />)}</Grid>
                </>
              )}
            </>
          )}

        </div>
      </main>
    </>
  )
}
